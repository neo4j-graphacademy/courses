import { write } from "../../modules/neo4j";

export async function setUserProfileVisibility(sub: string, hide: boolean): Promise<void> {
    await write(`
        MATCH (u:User {sub: $sub})
        ${hide === true ? 'SET u:HiddenProfile' : 'REMOVE u:HiddenProfile'}
    `, { sub })
}
