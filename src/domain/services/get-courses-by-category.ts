import { read } from "../../modules/neo4j";
import { Category } from "../model/category";
import { Course, STATUS_DISABLED } from "../model/course";

interface DbCategory extends Category {
    parents: string[]
}

interface DbCourse extends Course {
    categoryIds: string[]
}

export async function getCoursesByCategory(): Promise<Category[]> {
    const res = await read(`
        MATCH (c:Course)
        WHERE c.status <> $disabled
        WITH collect(c {
            .*,
            categoryIds: [(c)-[:IN_CATEGORY]->(ct) | ct.id]
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
            .map((row: DbCategory) => ({
                ...row,
                courses: courses.filter((course: DbCourse) => course.categoryIds.includes(row.id)),
            }))

    const root = categories.filter((category: DbCategory) => !category.parents.length)

    return root.map((category: DbCategory) => ({
        ...category,
        children: categories.filter((row: DbCategory) => row.parents.includes(category.id))
    }))
}