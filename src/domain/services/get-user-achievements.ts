import NotFoundError from '../../errors/not-found.error'
import { read } from '../../modules/neo4j'
import { formatCourse } from '../../utils'
import { CourseWithProgress, STATUS_DRAFT } from '../model/course'
import { User } from '../model/user'
import { appendParams, courseCypher } from './cypher'

interface Achievements {
    user: User
    categories: {
        link: string;
        type: string;
        title: string;
        courses: CourseWithProgress[];
    }[]
}

export async function getUserAchievements(id: string): Promise<Achievements> {
    const res = await read(
        `
        MATCH (u:User {id: $id})

        OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e:CompletedEnrolment)-[:FOR_COURSE]->(c)
        WHERE NOT c.status IN $exclude + $STATUS_DRAFT

        WITH e, u, c
        ORDER BY e.completedAt ASC

        RETURN u { .*} AS user,
            CASE WHEN c:Certification THEN 'Certifications' ELSE 'Completed Courses' END AS title,
            CASE WHEN c:Certification THEN 'certification' ELSE 'course' END AS type,
            '/u/'+ u.id +'/'+ CASE WHEN NOT c:Certification THEN 'courses/' ELSE '' END AS link,
            collect(${courseCypher('e', 'u')}) AS courses
        ORDER BY link ASC
    `,
        appendParams({ id, STATUS_DRAFT })
    )

    if (res.records.length === 0) {
        throw new NotFoundError(`User ${id} or completed enrolments not found`)
    }

    const user = res.records[0].get('user')
    const categories = await Promise.all(res.records.map(async row => ({
        title: row.get('title'),
        type: row.get('type'),
        link: row.get('link'),
        courses: await Promise.all(row.get('courses').map(course => formatCourse(course))),
    })))

    return {
        user,
        categories,
    }
}
