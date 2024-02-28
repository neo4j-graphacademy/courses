import { read } from "../../../modules/neo4j";
import Team from "../../model/team";

export default async function getTeam(id: string): Promise<Team | undefined> {
  const res = await read<{ team: Team }>(
    `MATCH (t:Team {id: $id}) RETURN t { .* } AS team`,
    { id }
  )

  if (res.records.length === 1) {
    return res.records[0]?.get('team')
  }

}
