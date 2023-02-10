import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { write } from "../../modules/neo4j";
import { saveUserInfo } from "../../modules/sandbox";
import { UserUpdatedAccount } from "../events/UserUpdatedAccount";
import { User } from "../model/user";

export interface UserUpdates {
    nickname: string | null;
    givenName: string | null;
    position?: string | null;
    company?: string | null;
    country?: string | null;
    unsubscribed: boolean;
}

export async function updateUser(token: string, user: User, updates: UserUpdates): Promise<User> {
    // Null keys that don't exist
    for (const key in updates) {
        if (typeof updates[key] === 'string' && updates[key].trim() === '') {
            updates[key] = null
        }
    }

    const res = await write(`
        MERGE (u:User {sub: $id})
        SET u.updatedAt = datetime(), u += $updates,
            u.profileCompletedAt = coalesce(u.profileCompletedAt, datetime())
        RETURN u
    `, {
        id: user.sub,
        updates,
    })

    if (res.records.length === 0) {
        throw new NotFoundError(`No user with sub ${user.sub}`)
    }

    const output: User = res.records[0].get('u')

    try {
        const parts = updates.givenName?.split(' ', 2)
        const meta = {
            first_name: parts ? parts[0] : updates.nickname || '',
            last_name: parts ? parts[1] : '',
            user_id: user.sub,
            company: user.company
        }

        await saveUserInfo(token, user, {
            ...meta,
            user_metadata: meta,
        })
    }
    catch (e: unknown) {
        // Fine
    }

    // Fire event
    emitter.emit(new UserUpdatedAccount(user, updates))

    return {
        ...user,
        ...output,
    }
}
