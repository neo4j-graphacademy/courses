import { SandboxInstanceProvider } from "./providers/sandbox/sandbox-instance.provider"
import { AuraInstanceProvider } from "./providers/aura/aura-instance.provider"
import { InstanceProvider } from "./instance-provider.interface"

export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc'

export const DATABASE_PROVIDER_SANDBOX = 'sandbox'
export const DATABASE_PROVIDER_AURA = 'aura'
export const DATABASE_PROVIDER_DEFAULT = DATABASE_PROVIDER_SANDBOX

export type DatabaseProvider = typeof DATABASE_PROVIDER_SANDBOX | typeof DATABASE_PROVIDER_AURA | undefined

export const INSTANCE_STATUS_PENDING = 'PENDING'
export const INSTANCE_STATUS_READY = 'READY'
export const INSTANCE_STATUS_NOT_FOUND = 'NOTFOUND'

export default async function databaseProvider(provider: DatabaseProvider): Promise<InstanceProvider> {
    if (provider === undefined) {
        provider = DATABASE_PROVIDER_DEFAULT
    }

    if (provider === DATABASE_PROVIDER_AURA) {
        return AuraInstanceProvider.create()
    }

    return Promise.resolve(new SandboxInstanceProvider())
}
