import path from 'path'
import fs from 'fs'
import { loadFile } from '../../../modules/asciidoc'
import { write } from '../../../modules/neo4j';
import { ATTRIBUTE_PARENT, Category } from '../../model/category';
import { ASCIIDOC_DIRECTORY } from '../../../constants';

interface CategoryWithParent extends Category {
    parent?: string;
}

const loadCategories = (): Category[] => {
    const folder = path.join(ASCIIDOC_DIRECTORY, 'categories')
    return fs.readdirSync( folder )
        .map(slug => loadCategory( path.join('categories', slug) ))
}

const loadCategory = (filepath: string): CategoryWithParent => {
    const slug = filepath.split('/').filter(a => !!a).pop()!.replace('.adoc', '') as string
    const file = loadFile(path.join(filepath))
    const parent = file.getAttribute(ATTRIBUTE_PARENT, null)
    const description = file.getContent()

    return {
        id: '',
        slug,
        title: file.getTitle() as string,
        description,
        parent,
    }
}

export async function mergeCategories(): Promise<void> {
    const categories = loadCategories()

    await write(`
        UNWIND $categories AS row
        MERGE (c:Category {id: apoc.text.base64Encode(row.slug)})
        SET c += row { .slug, .title, .description }

        FOREACH (_ IN CASE WHEN row.parent IS NOT NULL THEN [1] ELSE [] END |
            MERGE (p:Category {id: apoc.text.base64Encode(row.parent)})
            MERGE (p)-[:HAS_CHILD]->(c)
        )
    `, { categories })

    /* tslint:disable-next-line */
    console.log(`🎒 ${categories.length} Categories merged into graph`);
}