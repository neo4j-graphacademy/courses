import { User } from "../model/user"

const QUERY_TYPE_READ = 'r'
const QUERY_TYPE_READ_WRITE = 'rw'
const QUERY_TYPE_WRITE = 'w'
const QUERY_TYPE_SCHEMA = 's'
const QUERY_TYPE_SYSTEM = 's'

type QueryType = typeof QUERY_TYPE_READ | typeof QUERY_TYPE_READ_WRITE | typeof QUERY_TYPE_WRITE | typeof QUERY_TYPE_SCHEMA | typeof QUERY_TYPE_SYSTEM

interface QueryResultMeta {
    type: QueryType;
    query: string;
    records: number; // Count of res.records
    counters: Record<string, any>; // nodesCreated, nodesCreated, etc
    updates: Record<string, any>; // nodesCreated, nodesCreated, etc
    systemUpdates: number;
    notifications: Record<string, any>;
}

interface QueryErrorMeta {
    type: 'error',
    errorCode: string; // eg. "Neo.ClientError.Statement.SyntaxError"
    errorMessage: string; // Syntax error...
}

type QueryMeta = QueryResultMeta | QueryErrorMeta

// TODO: Implement fully
// @deprecated - decided by driver and passed through meta data instead
export function determineQueryType(cypher: string, database?: string | undefined): QueryType {
    // Convert Cypher to uppercase
    const upperCypher = cypher.toUpperCase()

    if (
        database ==='system' || upperCypher.includes('CREATE DATABASE') ||
        upperCypher.includes('SHOW USER') || upperCypher.includes('CREATE USER') || upperCypher.includes('DROP USER')
    ) {
        return QUERY_TYPE_SYSTEM
    }

    if ( upperCypher.includes('CREATE INDEX') || upperCypher.includes('CREATE CONSTRAINT') ||
        upperCypher.includes('DROP INDEX') || upperCypher.includes('DROP CONSTRAINT') ||
        upperCypher.includes('SHOW CONSTRAINTS') || upperCypher.includes('DROP CONSTRAINT')
    ) {
        return QUERY_TYPE_SCHEMA
    }

    if ( upperCypher.includes('MATCH') ) {
        return upperCypher.includes('MERGE') || upperCypher.includes('CREATE') ? QUERY_TYPE_READ_WRITE : QUERY_TYPE_WRITE
    }

    return QUERY_TYPE_READ
}

export class UserExecutedQuery {
    constructor(
        public readonly user: User,
        public readonly metaData: QueryMeta
    ) {}
}