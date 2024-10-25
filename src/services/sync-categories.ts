/* eslint-disable */
import path, { basename } from 'path'
import fs from 'fs'
import { loadFile } from '../modules/asciidoc'
import { write } from '../modules/neo4j';
import { ATTRIBUTE_CAPTION, ATTRIBUTE_LANGUAGE, ATTRIBUTE_LINK, ATTRIBUTE_PARENT, ATTRIBUTE_SHORTNAME, ATTRIBUTE_STATUS, CATEGORY_DIRECTORY, DEFAULT_LANGUAGE, Language } from '../constants';
import { categoryOverviewPath } from '../utils';


interface CategoryWithParents {
    slug: string;
    status: 'active' | 'disabled';
    title: string;
    language: Language;
    link: string;
    caption: string;
    description: string;
    shortName: string;

    parents: { category: string, order: number }[];
}

const loadCategories = (): CategoryWithParents[] => {
    const folder = path.join(CATEGORY_DIRECTORY)
    return fs.readdirSync(folder)
        .map(filename => basename(filename, '.adoc'))
        .map(slug => loadCategory(slug))
}

const loadCategory = (slug: string): CategoryWithParents => {
    const file = loadFile(categoryOverviewPath(slug))

    const status = file.getAttribute(ATTRIBUTE_STATUS, 'active')
    const caption = file.getAttribute(ATTRIBUTE_CAPTION, null)
    const shortName = file.getAttribute(ATTRIBUTE_SHORTNAME, null)
    const description = file.getContent()
    const link = file.getAttribute(ATTRIBUTE_LINK, null)
    const language = file.getAttribute(ATTRIBUTE_LANGUAGE, DEFAULT_LANGUAGE)


    const parents = file.getAttribute(ATTRIBUTE_PARENT, '')
        .split(',')
        .map((e: string) => e?.trim() || '')
        .filter((e: string) => e !== '')
        .map((entry: string) => entry.split(':'))
        // @ts-ignore
        .map(([category, order]) => ({ order: order || '99', category: category?.trim() }))


    return {
        slug,
        status,
        title: file.getTitle() as string,
        language,
        link,
        caption,
        description,
        shortName,
        parents,
    }
}

export async function syncCategories(): Promise<void> {
    const categories = loadCategories()

    // Disable all categories
    await write(`MATCH (c:Category) SET c.status = 'disabled'`)

    // Remove all parent-child relationships
    await write(`MATCH (p:Category)-[r:HAS_CHILD]->(c:Category) DELETE r`)

    // Run import and update status
    await write(`
        UNWIND $categories AS row
        MERGE (c:Category {id: apoc.text.base64Encode(row.slug)})
        SET c += row { .slug, .status, .title, .description, .caption, .shortName, .language, .link }

        FOREACH (parent in row.parents |
            MERGE (p:Category {id: apoc.text.base64Encode(parent.category)})
            MERGE (p)-[r:HAS_CHILD]->(c)
            SET r.order = parent.order
        )
    `, { categories })

    console.log(`🎒 ${categories.length} Categories merged into graph`);
}
