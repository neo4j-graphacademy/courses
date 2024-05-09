/* eslint-disable */
import path, { basename } from 'path'
import fs from 'fs'
import { loadFile } from '../modules/asciidoc'
import { write } from '../modules/neo4j';
import { ATTRIBUTE_CAPTION, ATTRIBUTE_LANGUAGE, ATTRIBUTE_LINK, ATTRIBUTE_PARENT, ATTRIBUTE_SHORTNAME, ATTRIBUTE_STATUS, CATEGORY_DIRECTORY, DEFAULT_LANGUAGE } from '../constants';
import { Language } from '../types';
import { categoryOverviewPath } from '../utils';


interface CategoryWithParent {
    slug: string;
    status: 'active' | 'disabled';
    title: string;
    language: Language;
    link: string;
    caption: string;
    description: string;
    shortName: string;

    parent?: string;
}

const loadCategories = (): CategoryWithParent[] => {
    const folder = path.join(CATEGORY_DIRECTORY)
    return fs.readdirSync(folder)
        .map(filename => basename(filename, '.adoc'))
        .map(slug => loadCategory(slug))
}

const loadCategory = (slug: string): CategoryWithParent => {
    const file = loadFile(categoryOverviewPath(slug))

    const status = file.getAttribute(ATTRIBUTE_STATUS, 'active')
    const parent = file.getAttribute(ATTRIBUTE_PARENT, null)
    const caption = file.getAttribute(ATTRIBUTE_CAPTION, null)
    const shortName = file.getAttribute(ATTRIBUTE_SHORTNAME, null)
    const description = file.getContent()
    const link = file.getAttribute(ATTRIBUTE_LINK, null)
    const language = file.getAttribute(ATTRIBUTE_LANGUAGE, DEFAULT_LANGUAGE)

    return {
        slug,
        status,
        title: file.getTitle() as string,
        language,
        link,
        caption,
        description,
        shortName,
        parent,
    }
}

export async function mergeCategories(): Promise<void> {
    const categories = loadCategories()

    // Disable all categories
    await write(`MATCH (c:Category) SET c.status = 'disabled'`)

    // Run import and update status
    await write(`
        UNWIND $categories AS row
        MERGE (c:Category {id: apoc.text.base64Encode(row.slug)})
        SET c += row { .slug, .status, .title, .description, .caption, .shortName, .language, .link }

        FOREACH (_ IN CASE WHEN row.parent IS NOT NULL THEN [1] ELSE [] END |
            MERGE (p:Category {id: apoc.text.base64Encode(row.parent)})
            MERGE (p)-[:HAS_CHILD]->(c)
        )
    `, { categories })

    console.log(`🎒 ${categories.length} Categories merged into graph`);
}
