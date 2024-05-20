import { Transaction } from "neo4j-driver";
import { Category } from "../model/category";
import { Course } from "../model/course";

let categories: Category<Course>[]

type CategoryMapping = {
    slug: string;
    order: number;
}

type IntermediateCategory = Omit<Category<Course>, 'children'> & {
    parents: CategoryMapping[];
    children: CategoryMapping[];
}


function getCategoryWithChildren(category: IntermediateCategory, categories: IntermediateCategory[]): Category<Course> {
    return {
        ...category,
        children: categories.filter(item => item.parents.map(cat => cat.slug).includes(category.slug))
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
            children: [ (c)-[chr:HAS_CHILD]->(ch) | {slug: ch.slug, order: chr.order} ],
            parents: [ (c)<-[pr:HAS_CHILD]-(p) | {slug: p.slug, order: pr.order} ]
        } AS category
    `, {

    })

    const all = res.records.map(row => row.get('category'))

    categories = all.filter(category => category.parents.length === 0)
        .map(root => getCategoryWithChildren(root, all))

    return categories
}
