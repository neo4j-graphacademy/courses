import NotFoundError from "../../../errors/not-found.error";
import { readTransaction } from "../../../modules/neo4j";
import { mergeCourseAndEnrolment } from "../../../utils";
import { Course, CourseWithProgress } from "../../model/course";
import Team from "../../model/team";
import { User } from "../../model/user";
import getEnrolments from "../enrolments/get-enrolment";
import { getTeamWork } from "./get-team";
import getUserMembership, { MembershipStatus } from "./get-user-membership";

type MemberProgress = Pick<User, 'id' | 'sub' | 'picture' | 'givenName' | 'email' | 'company' | 'country' | 'position'> & {
    enrolments: {
        title: string;
        slug: string;
        enrolled: boolean;
        completed: boolean;
    }[]
}

type TeamProgress = {
    team: Team;
    courses: Course[];
    members: MemberProgress[];
    matrix: Record<string, Record<string, { enrolled: boolean, completed: boolean }>>
    membership: MembershipStatus;
}

export async function getTeamProgress(teamId: string, user: User | undefined): Promise<TeamProgress> {
    const res = await readTransaction<TeamProgress>(async tx => {

        // Team Information
        const { team, courses } = await getTeamWork(tx, teamId, user)

        // Not found?
        if (team === undefined) {
            throw new NotFoundError(`Team with id ${teamId} not found`)
        }

        // Private?
        const membership = user ? await getUserMembership(tx, user.sub, teamId) : {}
        if (!team.public && !membership.isMember) {
            throw new NotFoundError(`Team with id ${teamId} not found*`)
        }

        // Get learning path
        const res = await tx.run(`
            MATCH (t:Team {id: $teamId})<-[:MEMBER_OF]-(u)
            RETURN u { .id, .sub, .picture, .givenName, .email, .position, .company, .country,
                enrolments: [ (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c) | c {
                    .slug,
                    .title,
                    enrolled: true,
                    completed: e:CompletedEnrolment,
                    certificateLink: CASE WHEN e:CompletedEnrolment THEN '/c/'+ c.certificateId ELSE null END
                } ]
            } AS user
            ORDER BY u.givenName ASC
        `, { teamId })

        const members = res.records.map(row => row.get('user'))
        return { team, courses, membership, members }
    })

    const matrix = {}

    for (const user of res.members) {
        const row = {}
        for (const course of res.courses) {
            const item = user.enrolments.find(el => el.slug == course.slug)

            row[course.slug] = item || {
                enrolled: false,
                completed: false,
            }
        }

        matrix[user.id] = row
    }

    return {
        ...res,
        matrix,
    }
}
