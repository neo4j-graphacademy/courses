import { read } from "../../modules/neo4j";
import { formatCourse, sortCourses } from "../../utils";
import { Category } from "../model/category";
import { Course, Language, LANGUAGE_EN } from "../model/course";
import { User } from "../model/user";
import { appendParams, categoryCypher } from "./cypher";

interface DbCategory extends Category<any> {
    order: number;
    parents: string[]
}

export async function getCoursesByCategory<T extends Course>(user?: User, language: Language = LANGUAGE_EN): Promise<Category<T>[]> {
    const res = await read(`
        MATCH (c:Course)
        WHERE NOT c.status IN $exclude AND c.language = $language
        ${user !== undefined ? 'OPTIONAL MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        WITH collect(c {
            .*,
            ${user !== undefined ? `
                enrolled: e IS NOT NULL, completed: e:CompletedEnrolment, createdAt: e.createdAt, completedAt: e.completedAt,
                completedPercentage: CASE WHEN e IS NOT NULL AND size((c)-[:HAS_MODULE|HAS_LESSON*2]->()) > 0 THEN toString(toInteger((1.0*size((e)-[:COMPLETED_LESSON]->()) / size((c)-[:HAS_MODULE]->()-[:HAS_LESSON]->())*100))) ELSE 0 END,
            ` : ''}
            categoryIds: [(c)-[r:IN_CATEGORY]->(ct) | {id: ct.id, order: r.order}],
            categories: [(c)-[r:IN_CATEGORY]->(ct) | ct {
                .*,
                link: coalesce(ct.link, '/categories/'+ ct.slug +'/'),
                order: r.order
            }],
            modules: [(c)-[:HAS_MODULE]->(m) | m.slug ]
        }) AS courses

        MATCH (ct:Category)
        WHERE exists((ct)<-[:IN_CATEGORY]-()) OR exists((ct)-[:HAS_CHILD]->())
        RETURN courses,
            collect( ${categoryCypher('ct', true)}) AS categories
    `, appendParams({ sub: user?.sub, language }))

    const courses = await Promise.all(res.records[0].get('courses').map(async (course: T) => await formatCourse<T>(course))) as T[]
    const categories = res.records[0].get('categories')
        .map((row: DbCategory) => {
            const categoryCourses: T[] = courses.map((course: T) => {
                const categoryWithOrder = course.categories.find((value: any) => value.id === row.id) as DbCategory

                if ( !categoryWithOrder ) return;

                return { ...course, order: categoryWithOrder.order }
            })
            .filter((e: any) => !!e) as T[]

            // Sort courses by status, then order
            sortCourses(categoryCourses)

            return {
                ...row,
                courses: categoryCourses,
            } as Category<T>
        })

    const root = categories.filter((category: DbCategory) => !category.parents.length)

    return root.map((category: DbCategory) => ({
        ...category,
        children: categories.filter((row: DbCategory) => row.parents.includes(category.id))
    }))
}