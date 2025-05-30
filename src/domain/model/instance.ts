export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc'

export interface Instance {
    id: string;
    hashKey: string;
    usecase: string;

    scheme: Neo4jScheme;
    ip: string | undefined;
    host: string;
    boltPort: string;
    username: string;
    password: string;
    expires: number;

    vectorOptimized: boolean;
    graphAnalyticsPlugin: boolean;

    [key: string]: any;
}