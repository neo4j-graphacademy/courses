import { writeTransaction } from "../../../modules/neo4j";
import Team from "../../model/team";
import { User } from "../../model/user";


enum Outcome {
  NOT_FOUND,
  INCORRECT_PIN,
  ALREADY_MEMBER,
  JOINED,
}

export default async function joinTeam(user: User, id: string, pin?: string): Promise<{ team?: Team, error?: string | undefined }> {
  const { outcome, team }: { outcome: Outcome, team: Team | undefined } = await writeTransaction(async tx => {
    const res = await tx.run(`
      MATCH (u:User {sub: $sub})
      MATCH (t:Team {id: $id})
      RETURN t { .* } as team, exists { (u)-[:MEMBER_OF]->(t) } AS joined
    `, { sub: user.sub, id })

    if (res.records.length === 0) {
      return {
        outcome: Outcome.NOT_FOUND
      }
    }

    const team = res.records[0].get('team') as Team
    const joined = res.records[0].get('joined')

    if (joined) {
      return {
        team,
        outcome: Outcome.ALREADY_MEMBER,
      }
    }
    else if (team.pin !== undefined && team.pin !== pin) {
      return {
        team,
        outcome: Outcome.INCORRECT_PIN,
      }
    }

    await tx.run(`
      MATCH (u:User {sub: $sub})
      MATCH (t:Team {id: $id})
      MERGE (u)-[r:MEMBER_OF]->(t)
      ON CREATE SET r.createdAt = datetime()
    `, { sub: user.sub, id })

    return {
      team,
      outcome: Outcome.JOINED
    }
  })

  if (team === undefined) {
    return {
      error: `Team ${id} could not be found`
    }
  }

  else if (outcome === Outcome.INCORRECT_PIN) {
    return { team, error: `Incorrect PIN for team ${id}` }
  }

  return {
    team,
    error: undefined,
  }
}
