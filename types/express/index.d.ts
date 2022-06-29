import { Driver } from "neo4j-driver";

declare global {
    namespace Express {
        interface Request {
            neo4j?: Driver;
        }
    }
}