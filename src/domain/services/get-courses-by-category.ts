import { read } from "../../modules/neo4j";
import { formatCourse } from "../../utils";
import { Category } from "../model/category";
import { Course, STATUS_DISABLED } from "../model/course";
import { User } from "../model/user";

interface DbCategory extends Category {
    order: number;
    parents: string[]
}

export async function getCoursesByCategory(user?: User): Promise<Category[]> {
    const res = await read(`
        MATCH (c:Course)
        WHERE c.status <> $disabled
        ${user !== undefined ? 'OPTIONAL MATCH (u:User {oauthId: $user})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        WITH collect(c {
            .*,
            ${user !== undefined ? `
                enrolled: e IS NOT NULL, completed: e:CompletedEnrolment, createdAt: e.createdAt, completedAt: e.completedAt,
                completedPercentage: CASE WHEN e IS NOT NULL THEN 1.0*size((e)-[:COMPLETED_LESSON]->()) / size((c)-[:HAS_MODULE]->()-[:HAS_LESSON]->()) ELSE 0 END,
            ` : ''}
            categoryIds: [(c)-[r:IN_CATEGORY]->(ct) | {id: ct.id, order: r.order}],
            categories: [(c)-[r:IN_CATEGORY]->(ct) | ct {
                .*,
                link: '/categories/'+ c.slug +'/',
                order: r.order
            }],
            modules: [(c)-[:HAS_MODULE]->(m) | m.slug ]
        }) AS courses

        MATCH (c:Category)
        WHERE exists((c)<-[:IN_CATEGORY]-()) OR exists((c)-[:HAS_CHILD]->())
        RETURN courses,
            collect(c {
                .*,
                link: '/categories/'+ c.slug +'/',
                parents: [(c)<-[:HAS_CHILD]-(p) | p.id ]
            }) AS categories
    `, { disabled: STATUS_DISABLED, user: user?.sub  })

    const courses = res.records[0].get('courses').map((course: Course) => formatCourse(course))
    const categories = res.records[0].get('categories')
        .map((row: DbCategory) => {
            const categoryCourses = courses.map((course: Course) => {
                const categoryWithOrder = course.categories.find((value: any) => value.id === row.id) as DbCategory

                if ( !categoryWithOrder ) return;

                return { ...course, order: categoryWithOrder.order }
            })
            .filter((e: any) => !!e)

            categoryCourses.sort((a: any, b: any) => parseInt(a.order) < parseInt(b.order) ? -1 : 1)

            return {
                ...row,
                courses: categoryCourses,
            }
        })


    const root = categories.filter((category: DbCategory) => !category.parents.length)

    return root.map((category: DbCategory) => ({
        ...category,
        children: categories.filter((row: DbCategory) => row.parents.includes(category.id))
    }))
}