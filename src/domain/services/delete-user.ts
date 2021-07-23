import { write } from "../../modules/neo4j"
import { User } from "../model/user"

// TODO: Delete user and enrolments?
export async function deleteUser(user: User): Promise<boolean> {
    const res = await write(`
        MATCH (u:User {sub: $id})
        SET u:DeletedUser,
            u = { sub: '[deleted]-'+ apoc.text.base64Decode(u.sub), createdAt: u.createdAt, deletedAt: timestamp() }

        // MATCH p = (u)-[:HAS_ENROLMENT|HAS_ATTEMPT|PROVIDED_ANSWER*1..3]->(n)
        // DETACH DELETE n, u

        RETURN true AS status
    `, { id: user.sub })

    return res.records[0]?.get('status') || false as boolean
}
