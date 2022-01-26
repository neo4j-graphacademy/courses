import { read } from "../../modules/neo4j";
import { formatCourse } from "../../utils";
import { Category } from "../model/category";
import { Course } from "../model/course";
import { User } from "../model/user";
import { appendParams } from "./cypher";

interface DbCategory extends Category {
    order: number;
    parents: string[]
}

export async function getCoursesByCategory(user?: User): Promise<Category[]> {
    const res = await read(`
        MATCH (c:Course)
        WHERE NOT c.status IN $exclude
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
                link: '/categories/'+ ct.slug +'/',
                order: r.order
            }],
            modules: [(c)-[:HAS_MODULE]->(m) | m.slug ]
        }) AS courses

        MATCH (ct:Category)
        WHERE exists((ct)<-[:IN_CATEGORY]-()) OR exists((ct)-[:HAS_CHILD]->())
        RETURN courses,
            collect(ct {
                .*,
                link: '/categories/'+ ct.slug +'/',
                parents: [(ct)<-[:HAS_CHILD]-(p) | p.id ]
            }) AS categories
    `, appendParams({ sub: user?.sub  }))

    const courses = await Promise.all(res.records[0].get('courses').map(async (course: Course) => await formatCourse(course))) as Course[]
    const categories = res.records[0].get('categories')
        .map((row: DbCategory) => {
            const categoryCourses: Course[] = courses.map((course: Course) => {
                const categoryWithOrder = course.categories.find((value: any) => value.id === row.id) as DbCategory

                if ( !categoryWithOrder ) return;

                return { ...course, order: categoryWithOrder.order }
            })
            .filter((e: any) => !!e) as Course[]

            categoryCourses.sort((a: any, b: any) => parseInt(a.order) < parseInt(b.order) ? -1 : 1)

            return {
                ...row,
                courses: categoryCourses,
            } as Category
        })

    const root = categories.filter((category: DbCategory) => !category.parents.length)

    return root.map((category: DbCategory) => ({
        ...category,
        children: categories.filter((row: DbCategory) => row.parents.includes(category.id))
    }))
}