import { read } from "../../../modules/neo4j";
import Team from "../../model/team";
import { User } from "../../model/user";


export default async function getUserTeams(user: User): Promise<Team[]> {
  const res = await read<{ team: Team }>(`
    MATCH (t:Team)<-[:MEMBER_OF]-(u:User {sub: $sub})
    RETURN t {
      .*,
      memberCount: COUNT { (t)<-[:MEMBER_OF]-() }
     } AS team
     ORDER BY team.name ASC
  `, { sub: user.sub })

  return res.records.map(row => row.get('team'))
}
