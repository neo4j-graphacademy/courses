import { User } from "../model/user"

export const QUERY_TYPE_READ = 'read'
export const QUERY_TYPE_WRITE = 'write'
export const QUERY_TYPE_SCHEMA = 'schema'
export const QUERY_TYPE_SYSTEM = 'system'

export type QueryType = typeof QUERY_TYPE_READ | typeof QUERY_TYPE_WRITE | typeof QUERY_TYPE_SCHEMA | typeof QUERY_TYPE_SYSTEM

// TODO: Implement fully
export function determineQueryType(cypher: string, database?: string | undefined): QueryType {
    let type: QueryType = QUERY_TYPE_READ

    if ( database ==='system' || cypher.includes('CREATE DATABASE') ) {
        type = QUERY_TYPE_SYSTEM
    }

    if ( cypher.includes('CREATE INDEX') || cypher.includes('CREATE CONSTRAINT') ) {
        type = QUERY_TYPE_SCHEMA
    }

    if ( cypher.includes('MERGE') || cypher.includes('CREATE') ) {
        type = QUERY_TYPE_WRITE
    }

    return type
}

export class UserExecutedQuery {
    constructor(
        public readonly user: User,
        public readonly type: QueryType,
        public readonly cypher: string,
        public readonly source: string,
        public readonly numberOfStatements: number
    ) {}
}