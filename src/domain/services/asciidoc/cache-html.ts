import { ASCIIDOC_CACHING_ENABLED } from "../../../constants";
import { addToCache, convertLessonOverview, generateLessonCacheKey } from "../../../modules/asciidoc";
import { read } from "../../../modules/neo4j";
import { getPageAttributes } from "../../../utils";
import { STATUS_ACTIVE } from "../../model/course";

export async function cacheHTML(): Promise<void> {
    if ( ! ASCIIDOC_CACHING_ENABLED ) {
        return
    }

    const start = new Date()

    const res = await read(`
        MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
        WHERE c.status = $active AND l.disableCache = false
        RETURN c AS course, m.slug AS module, l.slug AS lesson
    `, { active: STATUS_ACTIVE })


    for (const row of res.records) {
        const { course, module, lesson } = row.toObject()

        // Generate Attributes for the page
        const attributes = await getPageAttributes(undefined, course.properties)

        // Get Cache Key
        const key = generateLessonCacheKey(course.properties.slug, module, lesson)

        // Generate HTMl
        const html = await convertLessonOverview(course.properties.slug, module, lesson, attributes)

        // Cache it
        addToCache(key, html)
    }

    const end = new Date()

    const interval = end.getTime() - start.getTime()
    const difference = new Date(interval)

    const lpad = (value: number): string => ('00'+value).substr(-2)

    /* tslint:disable-next-line */
    console.log(`🧠 Cached ${res.records.length} lessons in ${lpad(difference.getMinutes())}:${lpad(difference.getSeconds())}.${difference.getMilliseconds()}`)
}