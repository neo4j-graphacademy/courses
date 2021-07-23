import NotFoundError from "../../errors/not-found.error";
import { write } from "../../modules/neo4j";
import { User } from "../model/user";



interface UserUpdates {
    nickname: string;
    givenName: string;
    position?: string;
    company?: string
}

export async function updateUser(user: User, updates: UserUpdates): Promise<User> {

    const res = await write(`
        MERGE (u:User {sub: $id})
        SET u.updatedAt = datetime(), u += $updates
        RETURN u
    `, {
        id: user.sub,
        updates,
    })

    if ( res.records.length == 0 ) {
        throw new NotFoundError(`No user with sub ${user.sub}`)
    }

    const output: User = res.records[0].get('u')

    return {
        ...user,
        ...output,
    }
}