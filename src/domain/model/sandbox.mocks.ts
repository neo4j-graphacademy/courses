import { Neo4jScheme } from "../../modules/sandbox"
import { Sandbox } from "./sandbox"

export function devSandbox(): Sandbox {
    const {
        SANDBOX_DEV_INSTANCE_ID,
        SANDBOX_DEV_INSTANCE_HASH_KEY,
        SANDBOX_DEV_INSTANCE_SCHEME,
        SANDBOX_DEV_INSTANCE_HOST,
        SANDBOX_DEV_INSTANCE_PORT,
        SANDBOX_DEV_INSTANCE_USERNAME,
        SANDBOX_DEV_INSTANCE_PASSWORD,
    } = process.env

    return {
        sandboxId: SANDBOX_DEV_INSTANCE_ID as string,
        sandboxHashKey: SANDBOX_DEV_INSTANCE_HASH_KEY as string,
        scheme: (SANDBOX_DEV_INSTANCE_SCHEME || 'neo4j') as Neo4jScheme,
        boltPort: SANDBOX_DEV_INSTANCE_PORT || '7687' as string,
        host: SANDBOX_DEV_INSTANCE_HOST || 'localhost' as string,
        port: SANDBOX_DEV_INSTANCE_PORT || '7474' as string,
        ip: SANDBOX_DEV_INSTANCE_HOST || '127.0.0.1' as string,
        username: (SANDBOX_DEV_INSTANCE_USERNAME || 'neo4j'),
        password: (SANDBOX_DEV_INSTANCE_PASSWORD || 'letmein'),
        usecase: 'movies',
        expires: 0
    }
}
