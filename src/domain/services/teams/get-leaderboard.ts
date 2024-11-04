import { ManagedTransaction } from "neo4j-driver";
import NotFoundError from "../../../errors/not-found.error";
import { read, readTransaction } from "../../../modules/neo4j";
import { mergeCourseAndEnrolment } from "../../../utils";
import { Course, CourseWithProgress } from "../../model/course";
import Team, { MembershipRole } from "../../model/team";
import { User } from "../../model/user";
import { appendParams, courseCypher } from "../cypher";
import { getTeamWork } from "./get-team";
import getUserMembership from "./get-user-membership";
import { MembershipStatus } from "./get-user-membership";

type Leaderboard = {
  user: Partial<User>;
  points: number;
  total: number;
  percentage: number;
  firstEnrolment: string;
  count: number;
  completed: number;
  courses: { link: string; title: string, slug: string };
}[]

type LeaderboardOutput = {
  team: Team;
  courses: CourseWithProgress[] | undefined;
  membership: MembershipStatus;
  leaderboard: Leaderboard[] | undefined;
} & MembershipStatus;

async function getLeaderboardWork(tx: ManagedTransaction, id): Promise<Leaderboard[] | undefined> {
  const res = await tx.run(`
      MATCH (t:Team {id: $id})<-[:MEMBER_OF]-(u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
    WITH *,
      COUNT { (c)-[:HAS_MODULE|HAS_LESSON]->(l) WHERE not l:OptionalLesson } AS lessons,
      COUNT { (e)-[:COMPLETED_LESSON]->(l) } AS completed,
      coalesce(c.points, CASE WHEN c:Certification THEN 50 ELSE 10 END) AS pointsAvailable
    ORDER BY e.createdAt DESC

    WITH *,
      CASE WHEN e:Certification AND e:CompletedEnrolment THEN 1.0
      WHEN e:Certification AND NOT e:CompletedEnrolment THEN 0.2
      WHEN lessons = 0 THEN 0.2
      ELSE 1.0*(completed/lessons) END AS completedPercentage

    WITH t, u,
      collect([
        c { .link, .slug, .title },
        e:CompletedEnrolment
      ]) AS courses,
      sum( pointsAvailable * completedPercentage ) AS points,
      min(e.createdAt) as firstEnrolment,
      count(*) AS count

    ORDER BY points DESC, count DESC, firstEnrolment DESC

    WITH t,
      collect(u.sub) AS userSubs,
      collect({
        user: u { .* },
        points: points,
        firstEnrolment: toString(firstEnrolment),
        percentage: 100.0 * size([ n IN courses WHERE n[1] | n]) / count,
        count: count,
        completed: size([ n IN courses WHERE n[1] | n ]),
        courses: [ n IN courses WHERE n[1] | { link: n[0].link, title: n[0].title, slug: n[0].slug } ]
      }) AS leaderboard

    RETURN leaderboard[0..20] AS leaderboard
    `, appendParams({ id }))

  if (res.records.length) {
    return res.records[0].get('leaderboard')
  }
}

export default async function getLeaderboard(id: string, user: User | undefined): Promise<LeaderboardOutput> {
  const res = await readTransaction<LeaderboardOutput>(async tx => {
    // Team Information
    const { team, courses } = await getTeamWork(tx, id, user)

    // Leaderboard
    const leaderboard = await getLeaderboardWork(tx, id)

    // Membership
    const membership = user ? await getUserMembership(tx, user.sub, id) : {}

    return {
      team,
      courses,
      membership,
      leaderboard,
    }
  })

  const { team, membership } = res

  // Does it exist?
  if (!team) {
    throw new NotFoundError(`Couldn't find a Team with the ID ${id}`)
  }


  // Is it public?
  if (!team.public && !membership.isMember) {
    throw new NotFoundError(`Couldn't find a Team with the ID ${id}*`)
  }

  return res
}
