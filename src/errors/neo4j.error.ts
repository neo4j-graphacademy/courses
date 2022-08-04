export default class Neo4jError extends Error {
    status = 500

    constructor(message: string, public readonly query: string, public readonly parameters: Record<string, any> | undefined, public readonly database: string | undefined) {
        super(message)
    }
}