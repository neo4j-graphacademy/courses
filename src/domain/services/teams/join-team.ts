import { emitter } from "../../../events";
import { writeTransaction } from "../../../modules/neo4j";
import { UserJoinedTeam } from "../../events/UserJoinedTeam";
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
      MATCH (t:Team {id: $id})
      RETURN t { .* } as team
    `, { id })

    if (res.records.length === 0) {
      return {
        outcome: Outcome.NOT_FOUND
      }
    }

    const team = res.records[0].get('team')

    // handle incorrect pin
    if (team && team.pin !== undefined && team.pin !== pin) {
      return {
        outcome: Outcome.INCORRECT_PIN,
      }
    }

    // Check if user is already a member
    const memberCheck = await tx.run(`
      MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t:Team {id: $id})
      RETURN r
    `, { sub: user.sub, id })

    if (memberCheck.records.length > 0) {
      return {
        team,
        outcome: Outcome.ALREADY_MEMBER,
      }
    }

    // Create user and relationship in one go
    await tx.run(`
      MERGE (u:User {sub: $sub})
      ON CREATE SET u.id = randomUuid(), u.email = $email, u.givenName = $givenName
      WITH u
      MATCH (t:Team {id: $id})
      MERGE (u)-[r:MEMBER_OF]->(t)
      ON CREATE SET r.createdAt = datetime()
    `, {
      sub: user.sub,
      email: user.email,
      givenName: user.givenName,
      id
    })

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

  emitter.emit(new UserJoinedTeam(user, team))

  return {
    team,
    error: undefined,
  }
}
