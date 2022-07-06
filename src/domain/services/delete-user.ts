import { write } from "../../modules/neo4j"
import { User } from "../model/user"

// TODO: Delete user and enrolments?
export async function deleteUser(user: User): Promise<boolean> {
    const res = await write(`
        MATCH (u:User {sub: $id})
        SET u:DeletedUser,
            u.sub = '[deleted]-'+ apoc.text.base64Encode(u.sub),
            u.deletedAt = timestamp()

        RETURN true AS status
    `, { id: user.sub })

    return res.records[0]?.get('status') || false as boolean
}
