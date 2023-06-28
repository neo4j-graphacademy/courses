import { Transaction } from "neo4j-driver";
import { Category } from "../model/category";
import { Course } from "../model/course";

let categories: Category<Course>[]

type IntermediateCategory = Omit<Category<Course>, 'children'> & {
    parents: string[];
    children: string[];
}


function getCategoryWithChildren(category: IntermediateCategory, categories: IntermediateCategory[]): Category<Course> {
    return {
        ...category,
        children: categories.filter(item => item.parents.includes(category.slug))
            .map(category => getCategoryWithChildren(category, categories))
    }
}

export default async function getCategories(tx: Transaction): Promise<Category<Course>[]> {
    if (categories) {
        return categories
    }

    const res = await tx.run<{ category: IntermediateCategory, parents: string[] }>(`
        MATCH (c:Category)
        RETURN c {
            .*,
            link: coalesce(c.link, '/categories/'+ c.slug +'/'),
            children: [ (c)-[:HAS_CHILD]->(ch) | ch.slug ],
            parents: [ (c)<-[:HAS_CHILD]-(p) | p.slug ]
        } AS category
    `, {

    })

    const all = res.records.map(row => row.get('category'))

    categories = all.filter(category => category.parents.length === 0)
        .map(root => getCategoryWithChildren(root, all))

    return categories
}
