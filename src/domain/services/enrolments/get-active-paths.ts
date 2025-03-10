import { ValidLookupProperty } from "../../model/user";
import { ManagedTransaction, } from "neo4j-driver";
import { Category } from "../../model/category";
import { User } from "../../model/user";
import { Course } from "../../model/course";
import { appendParams } from "../cypher";

export default async function getUserActivePaths(tx: ManagedTransaction, user: Partial<User>, property: ValidLookupProperty = 'sub'): Promise<Category<Course>[]> {
    const res = await tx.run<{ category: Category<Course> }>(`
        MATCH (u:User {\`${property}\`: $sub})-[:HAS_ENROLMENT]->(e)-[:THROUGH_CATEGORY]->(c:Category)
        WHERE not e:CompletedEnrolment

        MATCH (c)<-[r:IN_CATEGORY]->(course)
        WITH c, r, course ORDER BY r.order ASC 

        WITH c, collect(course) AS courses

        RETURN c {
            .*,
            courses: courses
        } AS category
    `, appendParams({ property, sub: user[property] }))

    return res.records.map(record => record.get('category'))
}
