import NotFoundError from "../../../errors/not-found.error";
import { read } from "../../../modules/neo4j";
import Team from "../../model/team";
import { User } from "../../model/user";

type Leaderboard = {
  user: Partial<User>;
  points: number;
  total: number;
  percentage: number;
  firstEnrolment: string;
  completed: { link: string; title: string, slug: string };
}[]

type LeaderboardOutput = {
  team: Team,
  leaderboard: Leaderboard,
  isMember: boolean
}

export default async function getLeaderboard(id: string, user: User | undefined): Promise<LeaderboardOutput> {
  const res = await read<LeaderboardOutput>(`
    MATCH (t:Team {id: $id})<-[:MEMBER_OF]-(u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
    WITH *,
      COUNT { (c)-[:HAS_MODULE|HAS_LESSON]->(l) WHERE not l:OptionalLesson } AS lessons,
      COUNT { (e)-[:COMPLETED_LESSON]->(l) } AS completed,
      coalesce(c.points, CASE WHEN c:Certificatation THEN 50 ELSE 10 END) AS pointsAvailable
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
        completed: [ n IN courses WHERE n[1] | { link: n[0].link, title: n[0].title, slug: n[0].slug } ]
      }) AS leaderboard

    RETURN t {
      .*,
      members: size(userSubs)
    } AS team,
    leaderboard[0..20] AS leaderboard,
    $sub IS NOT NULL AND $sub IN userSubs AS isMember

  `, { id, sub: user?.sub || null })

  // Does it exist?
  if (res.records.length === 0) {
    throw new NotFoundError(`Couldn't find a Team with the ID ${id}`)
  }

  const { team, leaderboard, isMember } = res.records[0].toObject()

  // Is it public?
  if (!team.public && !isMember) {
    throw new NotFoundError(`Couldn't find a Team with the ID ${id}*`)
  }

  return {
    team,
    leaderboard,
    isMember
  }
}
