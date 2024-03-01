import { write } from "../../../modules/neo4j";
import Team from "../../model/team";
import { User } from "../../model/user";

export default async function leaveTeam(user: User, id: string): Promise<Team | undefined> {
  const res = await write<{ team: Team }>(`
    MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t:Team {id: $id})
    DELETE r
    RETURN t { .* } AS team
  `, { sub: user.sub, id })

  if (res.records.length > 0) {
    return res.records[0].get('team')
  }
}
