import { ASCIIDOC_CACHING_ENABLED } from "../../../constants";
import { addToCache, convertLessonOverview, generateLessonCacheKey } from "..";
import { read } from "../../neo4j";
import { getPageAttributes } from "../../../utils";
import { STATUS_ACTIVE } from "../../../domain/model/course";

export async function cacheHTML(): Promise<void> {
    if (!ASCIIDOC_CACHING_ENABLED) {
        return
    }

    const res = await read(`
        MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
        WHERE c.status = $active AND l.disableCache = false
        RETURN c AS course, m.slug AS module, l.slug AS lesson
    `, { active: STATUS_ACTIVE })

    res.records.forEach(async row => {
        const { course, module, lesson } = row.toObject()

        // Generate Attributes for the page
        const attributes = await getPageAttributes(undefined, course.properties)

        // Get Cache Key
        const key = generateLessonCacheKey(course.properties.slug, module, lesson)

        // Generate HTMl
        const html = await convertLessonOverview(course.properties.slug, module, lesson, attributes)

        // Cache it
        addToCache(key, html)
    })

    console.log(`🧠 Caching ${res.records.length} lessons`)
}