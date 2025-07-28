import { ManagedTransaction } from "neo4j-driver";
import { read, readTransaction } from "../../../modules/neo4j";
import { Course, CourseWithProgress } from "../../model/course";
import Team from "../../model/team";
import { appendParams, courseCypher } from "../cypher";
import { mergeCourseAndEnrolment } from "../../../utils";
import getEnrolments from "../enrolments/get-enrolment";
import { User } from "../../model/user";
import getUserMembership, { MembershipStatus } from "./get-user-membership";

type GetTeamResponse = {
  team?: Team;
  courses?: CourseWithProgress[];
  membership?: MembershipStatus;
}

export async function getTeamWork(tx: ManagedTransaction, id: string, user: User | undefined): Promise<GetTeamResponse> {
  const res = await tx.run(
    `
      MATCH (t:Team {id: $id}) 
      OPTIONAL MATCH (t)<-[r:ON_LEARNING_PATH_FOR]-(c)
      WITH t, c, r ORDER BY r.order ASC
      RETURN t { 
          .*,
          link: '/teams/' + t.id + '/',
          memberCount: COUNT { (t)<-[:MEMBER_OF]-() }
        } AS team, 
        collect(${courseCypher()}) AS courses
    `,
    appendParams({ id })
  )

  if (res.records.length === 0) {
    return {
      team: undefined,
      courses: undefined,
      membership: undefined
    }
  }

  const { team, courses } = res.records[0]?.toObject()

  const membership = user ? await getUserMembership(tx, user.sub, id) : undefined

  if (user && courses) {
    // Check enrolments on learning path
    const enrolments = await getEnrolments(tx, user, 'sub')

    // Append status to enrolments
    for (const enrolment of enrolments) {
      const index = courses.findIndex(el => el.slug === enrolment.courseSlug)
      if (index > -1) {
        courses[index] = await mergeCourseAndEnrolment(courses[index] as CourseWithProgress, enrolment)
      }
    }
  }

  return {
    team, courses, membership,
  }

}

export default function getTeam(id: string, user?: User): Promise<GetTeamResponse> {
  return readTransaction<GetTeamResponse>(tx => getTeamWork(tx, id, user))
}
