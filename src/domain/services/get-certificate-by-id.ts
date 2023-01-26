import NotFoundError from "../../errors/not-found.error";
import { read } from "../../modules/neo4j";
import { formatCourse } from "../../utils";
import { CourseWithProgress } from "../model/course";
import { User } from "../model/user";
import { appendParams, courseCypher } from "./cypher";

interface Certificate {
    course: CourseWithProgress;
    user: User;
}

export default async function getCertificateById(id: string): Promise<Certificate> {
    const res = await read(`
        MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)-[:FOR_COURSE]->(c)
        WHERE e.certificateId = $id
        RETURN ${courseCypher('e', 'u', 'c')} AS course,
            u { .* } AS user
        LIMIT 1
    `, appendParams({ id }))

    if (!res.records.length) {
        throw new NotFoundError(`Could not find certificate ${id}`)
    }

    const course = await formatCourse(res.records[0].get('course'))
    const user = res.records[0].get('user') as User

    return {
        course,
        user,
    }
}
