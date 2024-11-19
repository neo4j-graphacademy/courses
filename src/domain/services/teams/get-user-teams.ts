import { ManagedTransaction } from "neo4j-driver";
import { read, readTransaction } from "../../../modules/neo4j";
import Team from "../../model/team";
import { User } from "../../model/user";


export async function getUserTeamWork(tx: ManagedTransaction, user: User): Promise<Team[]> {
  const res = await tx.run(`
    MATCH (t:Team)<-[:MEMBER_OF]-(u:User {sub: $sub})
    RETURN t {
      .*,
      memberCount: COUNT { (t)<-[:MEMBER_OF]-() }
     } AS team
     ORDER BY team.name ASC
  `, { sub: user.sub })

  return res.records.map(row => row.get('team'))
}

export default function getUserTeams(user: User): Promise<Team[]> {
  return readTransaction<Team[]>(tx => getUserTeamWork(tx, user))
}
