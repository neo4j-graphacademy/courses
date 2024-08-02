import { ASCIIDOC_CACHING_ENABLED } from "../../../constants";
import { convertLessonOverview, generateLessonCacheKey } from "..";
import { read } from "../../neo4j";
import { getPageAttributes } from "../../../utils";
import { Course, STATUS_ACTIVE } from "../../../domain/model/course";

export async function cache(course: Course, module: string, lesson: string): Promise<string> {
    // Generate Attributes for the page
    const attributes = await getPageAttributes(undefined, course)

    // Get Cache Key
    const key = generateLessonCacheKey(course.slug, module, lesson)

    // console.log(key);

    // Generate HTMl
    await convertLessonOverview(course.slug, module, lesson, attributes)

    return key
}

export async function getLessons() {
    const res = await read<{ course: Course, module: string, lesson: string }>(`
        MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
        WHERE c.status = $active
        RETURN c {.* } AS course, m.slug AS module, l.slug AS lesson
    `, { active: STATUS_ACTIVE })

    return res.records.map(row => row.toObject())
}

export async function cacheHTML(): Promise<void> {
    if (!ASCIIDOC_CACHING_ENABLED) {
        console.log('[caching] disabled');

        return
    }

    console.log('[caching] enabled');

    const lessons = await getLessons()

    for (const { course, module, lesson } of lessons) {
        await cache(course, module, lesson)
    }

    console.log(`🧠 Cached ${lessons.length} lessons`)
}