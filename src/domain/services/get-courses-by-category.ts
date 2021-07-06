import { read } from "../../modules/neo4j";
import { Category } from "../model/category";
import { Course, STATUS_DISABLED } from "../model/course";
import { User } from "../model/user";

interface DbCategory extends Category {
    parents: string[]
}

interface DbCourse extends Course {
    categoryIds: DbCategoryMapping[]
}

interface DbCategoryMapping {
    id: string;
    order: string;
}

export async function getCoursesByCategory(user?: User): Promise<Category[]> {
    const res = await read(`

        MATCH (c:Course)
        WHERE c.status <> $disabled
        ${user !== undefined ? 'OPTIONAL MATCH (u:User {oauthId: $user})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        WITH collect(c {
            .*,
            ${user !== undefined ? `enrolled: e IS NOT NULL, completed: e:CompletedEnrolment, createdAt: e.createdAt, completedAt: e.completedAt,` : ''}
            categoryIds: [(c)-[r:IN_CATEGORY]->(ct) | {id: ct.id, order: r.order}],
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

    const courses = res.records[0].get('courses')
    const categories = res.records[0].get('categories')
            .map((row: DbCategory) => {
                const categoryCourses = courses.map((course: DbCourse) => {
                    const categoryOrder = course.categoryIds.find((value: any) => value.id === row.id)

                    if ( !categoryOrder ) return;

                    return { ...course, order: categoryOrder.order }
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