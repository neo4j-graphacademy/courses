import NotFoundError from "../../errors/not-found.error";
import { read } from "../../modules/neo4j";
import { formatCourse } from "../../utils";
import { CourseWithProgress } from "../model/course";
import { CategoryEnrolments } from "../model/enrolment";
import { User } from "../model/user";
import { appendParams, courseCypher } from "./cypher";

interface Achievements {
    user: User;
    categories: CategoryEnrolments[];
}

export async function getUserAchievements(id: string): Promise<Achievements> {
    const res = await read(`
        MATCH (u:User {id: $id})

        MATCH (c:Course)
        WHERE NOT c.status IN $exclude

        OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        WITH u, ${courseCypher('e', 'u')} AS course

        ORDER BY course.title ASC

        UNWIND course.categories AS category

        WITH u AS user, category, collect(course) AS courses
        ORDER BY category.title ASC

        WITH user, collect({category: category, courses: courses}) AS categories

        RETURN user, [ cat in categories where any(c in cat.courses where c.completed = true) ] AS categories
    `, appendParams({ id }))

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`User with id ${id} not found`)
    }

    const user = res.records[0].get('user').properties

    return {
        user,
        categories: await Promise.all(res.records[0].get('categories').map(async ({ category, courses }: any) => {
            const formattedCourses = await Promise.all(courses.map((course: CourseWithProgress) => formatCourse(course))) as CourseWithProgress[]
            const completedCount = courses.reduce((acc: number, course: CourseWithProgress) => course.completed ? acc + 1 : acc, 0)
            const completedPercentage = Math.round((completedCount / courses.length) * 100)

            return {
                category,
                courses: formattedCourses,
                completedCount,
                completedPercentage,
            }
        }))
    }
}
