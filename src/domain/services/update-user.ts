import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { write } from "../../modules/neo4j";
import { UserUpdatedAccount } from "../events/UserUpdatedAccount";
import { User } from "../model/user";
import joinTeam from "./teams/join-team";

export interface UserUpdates {
    nickname?: string | null;
    givenName?: string | null;
    position?: string | null;
    company?: string | null;
    country?: string | null;
    bio?: string | null;
    unsubscribed?: boolean;
    sidebarHidden?: boolean;
    prefersTranscript?: boolean;
}

export async function updateUser(token: string, user: User, updates: UserUpdates, team?: string): Promise<User> {
    // Null keys that don't exist
    for (const key in updates) {
        if (typeof updates[key] === 'string' && updates[key].trim() === '') {
            updates[key] = null
        }
    }

    const res = await write(`
        MERGE (u:User {sub: $id})
        SET u.updatedAt = datetime(), u += $updates,
            u.id = coalesce(u.id, randomUuid()),
            u.picture = coalesce($picture, u.picture),
            u.profileCompletedAt = coalesce(u.profileCompletedAt, datetime())
        RETURN u
    `, {
        id: user.sub,
        picture: user.picture,
        updates,
    })

    if (res.records.length === 0) {
        throw new NotFoundError(`No user with sub ${user.sub}`)
    }

    const output: User = res.records[0].get('u')

    // automatically join a team?
    if (team !== undefined) {
        console.log(',my team', team);

        await joinTeam(user, team)
    }

    // Fire event
    emitter.emit(new UserUpdatedAccount(user, updates))

    return {
        ...user,
        ...output,
    }
}
