import { read } from "../../modules/neo4j";
import { formatCourse, sortCourses } from "../../utils";
import { Category } from "../model/category";
import { Course, Language, LANGUAGE_EN } from "../model/course";
import { User } from "../model/user";
import { appendParams, categoryCypher } from "./cypher";

interface DbCategory extends Category<any> {
    order: number;
    parents: { id: string, order: number }[]
}

export async function getCoursesByCategory<T extends Course>(user?: User, term: string | undefined = undefined, language: Language = LANGUAGE_EN): Promise<Category<T>[]> {
    const res = await read(`
        MATCH (c:Course)
        WHERE NOT c.status IN $exclude AND c.language = $language
        ${user !== undefined ? 'OPTIONAL MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        WITH collect(c {
            .*,
            certification: c:Certification,
            ${user !== undefined ? `
                enrolled: e IS NOT NULL, completed: e:CompletedEnrolment, createdAt: e.createdAt, completedAt: e.completedAt,
                completedPercentage: CASE WHEN e IS NOT NULL AND size([(c)-[:HAS_MODULE|HAS_LESSON*2]->(l) | l]) > 0 THEN toString(toInteger((1.0*size([(e)-[:COMPLETED_LESSON]->(l) | l]) / size([(c)-[:HAS_MODULE]->()-[:HAS_LESSON]->(l) | l])*100))) ELSE 0 END,
            ` : ''}
            categoryIds: [(c)-[r:IN_CATEGORY]->(ct)  WHERE ct.status <> 'disabled' | {id: ct.id, order: r.order}],
            categories: [(c)-[r:IN_CATEGORY]->(ct) WHERE ct.status <> 'disabled' | ct {
                .*,
                link: coalesce(ct.link, '/categories/'+ ct.slug +'/'),
                order: r.order
            }],
            modules: [(c)-[:HAS_MODULE]->(m) | m.slug ],
            display: ${term !== undefined ? 'toLower(c.title) CONTAINS toLower($term) OR toLower(c.caption) CONTAINS toLower($term)' : 'true'}
        }) AS courses

        MATCH (ct:Category)
        WHERE NOT ct.status IN $exclude AND exists((ct)<-[:IN_CATEGORY]-()) OR exists((ct)-[:HAS_CHILD]->())
        RETURN courses,
            collect( ${categoryCypher('ct', true)}) AS categories
    `, appendParams({ sub: user?.sub, term, language }))

    const courses = await Promise.all(res.records[0].get('courses').map(async (course: T) => await formatCourse<T>(course))) as T[]
    const categories = res.records[0].get('categories')
        .map((row: DbCategory) => {
            const categoryCourses: T[] = courses.map((course: T) => {
                const categoryWithOrder = course.categories.find((value: any) => value.id === row.id) as DbCategory

                if (!categoryWithOrder) return;

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
        children: categories
            // Find only the categories under this parent
            .filter(
                (row: DbCategory) => row.parents.map(row => row.id).includes(category.id)
            )
            // Assign the order
            .map((child: DbCategory) => {
                const parentItem = child.parents.find(parent => parent.id === category.id)
                return {
                    ...child,
                    order: parentItem?.order || 99
                }
            })
            .sort((a, b) => a.order < b.order ? -1 : 1)

    })) as DbCategory[]
}