import { Neo4jScheme, Sandbox } from "../../modules/sandbox"

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
        scheme: SANDBOX_DEV_INSTANCE_SCHEME as Neo4jScheme,
        boltPort: SANDBOX_DEV_INSTANCE_PORT as string,
        host: SANDBOX_DEV_INSTANCE_HOST as string,
        port: SANDBOX_DEV_INSTANCE_PORT as string,
        username: SANDBOX_DEV_INSTANCE_USERNAME as string,
        password: SANDBOX_DEV_INSTANCE_PASSWORD as string,
        usecase: 'movies',
        expires: 0
    }
}