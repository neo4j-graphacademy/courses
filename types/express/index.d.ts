import { Driver } from "neo4j-driver";

declare module 'express' {
    interface Request {
        neo4j?: Driver;
    }
}