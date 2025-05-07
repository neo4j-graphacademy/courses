import { Transaction } from "neo4j-driver";
import { appendParams, categoryCypher, moduleCypher } from "./cypher";
import { Course } from "../model/course";
import { read } from "../../modules/neo4j";
import { formatCourse } from "../../utils";

interface RecordShape { course: Course }

let courses: Course[]

export default async function getCourses(tx?: Transaction): Promise<Course[]> {
    if (courses) {
        return courses
    }

    const query = `
        MATCH (c:Course)
        WHERE NOT c.status IN $exclude
        RETURN c {
            .*,
            certification: c:Certification,
            modules: apoc.coll.sortMaps([ (c)-[:HAS_MODULE]->(m) | ${moduleCypher()} ], '^order'),
            categories: [ (c)-[:IN_CATEGORY]->(cat) | ${categoryCypher('cat')} ],
            prerequisites: [ (c)<-[:PROGRESS_TO]-(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ],
            progressTo: [ (c)-[:PROGRESS_TO]->(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ],
            translations: [ (c)-[:HAS_TRANSLATION]-(translation) | translation { .language, .link, .slug, .title, .caption, .thumbnail } ]
        } AS course
    `

    const params = appendParams({})

    const res = await (tx ? tx.run<RecordShape>(query, params) : read(query, params))

    courses = await Promise.all(res.records.map(row => formatCourse(row.get('course')) as Promise<Course>))

    return courses
}
