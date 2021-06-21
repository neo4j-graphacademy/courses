import { read } from "../../modules/neo4j";
import { Category } from "../model/category";
import { Course, STATUS_DISABLED } from "../model/course";

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

export async function getCoursesByCategory(): Promise<Category[]> {
    const res = await read(`
        MATCH (c:Course)
        WHERE c.status <> $disabled
        WITH collect(c {
            .*,
            categoryIds: [(c)-[r:IN_CATEGORY]->(ct) | {id: ct.id, order: r.order}]
        }) AS courses

        MATCH (c:Category)
        WHERE exists((c)<-[:IN_CATEGORY]-()) OR exists((c)-[:HAS_CHILD]->())
        RETURN courses,
            collect(c {
                .*,
                parents: [(c)<-[:HAS_CHILD]-(p) | p.id ]
            }) AS categories
    `, { disabled: STATUS_DISABLED })

    const courses = res.records[0].get('courses')
    const categories = res.records[0].get('categories')
            .map((row: DbCategory) => {
                const categoryCourses = courses.map((course: DbCourse) => {
                    const categoryOrder = course.categoryIds.find((value: any) => value.id === row.id)

                    if ( !categoryOrder ) return;

                    return { ...course, order: categoryOrder.order }
                })
                .filter((e: any) => !!e)

                categoryCourses.sort((a: any, b: any) => a.order < b.order ? -1 : 1)

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