import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import initNeo4j, { write, close } from '../modules/neo4j';
import { ATTRIBUTE_CAPTION, ATTRIBUTE_STATUS, ATTRIBUTE_THUMBNAIL, ATTRIBUTE_USECASE, Course } from '../domain/model/course';
import { DEFAULT_COURSE_STATUS, DEFAULT_COURSE_THUMBNAIL } from '../constants'
import { loadFile } from '../modules/asciidoc'
import { ATTRIBUTE_ORDER, Module } from '../domain/model/module';
import { ATTRIBUTE_CYPHER, ATTRIBUTE_DURATION, ATTRIBUTE_SANDBOX, ATTRIBUTE_TYPE, ATTRIBUTE_VERIFY, Lesson, LESSON_TYPE_TEXT } from '../domain/model/lesson';
import { ATTRIBUTE_ANSWER } from '../domain/model/question';
import { decode } from 'html-entities'

dotenv.config()

console.clear();

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
} = process.env


const loadCourses = (): Course[] => {
    const folder = path.join(__dirname, '..', '..', 'asciidoc', 'courses')
    return fs.readdirSync( folder )
        .map(slug => loadCourse( path.join(folder, slug) ))
}

const loadCourse = (folder: string): Course => {
    const slug = <string> folder.split('/').filter(a => !!a).pop()
    const file = loadFile(path.join(folder, 'overview.adoc'))

    const moduleDir = path.join(folder, 'modules')
    const modules = fs.existsSync(moduleDir)
        ? fs.readdirSync(moduleDir)
            .filter(slug => fs.existsSync(path.join(moduleDir, slug, 'overview.adoc')))
            .map(slug => loadModule(path.join(folder, 'modules', slug)))
        : []

    return {
        slug,
        title: <string> file.getTitle(),
        status: file.getAttribute(ATTRIBUTE_STATUS, DEFAULT_COURSE_STATUS),
        thumbnail: file.getAttribute(ATTRIBUTE_THUMBNAIL, DEFAULT_COURSE_THUMBNAIL),
        caption: file.getAttribute(ATTRIBUTE_CAPTION),
        usecase: file.getAttribute(ATTRIBUTE_USECASE),
        modules,
    }
}

const loadModule = (folder: string): Module => {
    const slug = <string> folder.split('/').filter(a => !!a).pop()
    const file = loadFile(path.join(folder, 'overview.adoc'))

    const lessonsDir = path.join(folder, 'lessons')

    const lessons = fs.existsSync(lessonsDir)
        ? fs.readdirSync(lessonsDir)
            .filter(file => file.endsWith('.adoc'))
            .map(filename => loadLesson(path.join(lessonsDir, filename)))
            .sort((a, b) => a.order > b.order ? -1 : 1)
        : []

    return {
        path: path.join(folder, 'index.adoc'),
        slug,
        title: <string> file.getTitle(),
        order: file.getAttribute(ATTRIBUTE_ORDER),
        lessons,
    }
}

const loadLesson = (filepath: string): Lesson => {
    const slug = <string> filepath.split('/').filter(a => !!a).pop()!.replace('.adoc', '')
    const file = loadFile(filepath)

    // TODO: Load questions and answers into database

    return {
        path: filepath,
        slug,
        title: file.getTitle(),
        type: file.getAttribute(ATTRIBUTE_TYPE, LESSON_TYPE_TEXT),
        order: file.getAttribute(ATTRIBUTE_ORDER),
        duration: file.getAttribute(ATTRIBUTE_DURATION),
        sandbox: file.getAttribute(ATTRIBUTE_SANDBOX),
        cypher: decode(file.getAttribute(ATTRIBUTE_CYPHER)),
        answer: decode(file.getAttribute(ATTRIBUTE_ANSWER)),
        verify: decode(file.getAttribute(ATTRIBUTE_VERIFY)),
    } as Lesson
}

initNeo4j(<string> NEO4J_HOST, <string> NEO4J_USERNAME, <string> NEO4J_PASSWORD)
    .then(() => Promise.all(loadCourses()))
    .then(courses => write(`
        UNWIND $courses AS course
        MERGE (c:Course {slug: course.slug })
        SET
            c.id = apoc.text.base64Encode(course.slug),
            c.title = course.title,
            c.thumbnail = course.thumbnail,
            c.caption = course.caption,
            c.status = course.status,
            c.usecase = course.usecase,
            c.updatedAt = datetime()

        // Detach old modules
        FOREACH (m IN [ (c)-[:HAS_MODULE]->(m) | m ] |
            SET m:DeletedModule
        )

        FOREACH (r IN [ (c)-[r:HAS_MODULE]->() | r ] |
            DELETE r
        )

        WITH c, course

        UNWIND course.modules AS module
        MERGE (m:Module {id: apoc.text.base64Encode(course.slug +'--'+ module.slug) })
        SET
            m.title = module.title,
            m.slug = module.slug,
            m.order = toInteger(module.order),
            m.status = 'active',
            m.duration = module.duration,
            m.updatedAt = datetime()

        REMOVE m:DeletedModule

        MERGE (c)-[:HAS_MODULE]->(m)

        // Delete Next Module
        FOREACH (r IN [ (m)-[r:NEXT_MODULE]->() | r ] | DELETE r)

        // Detach old lessons
        FOREACH (l IN [ (m)-[:HAS_LESSON]->(l) | l ] |
            SET l:DeletedLesson
        )

        FOREACH (r IN [ (c)-[r:HAS_MODULE]->() | r ] |
            DELETE r
        )

        WITH m, c, course, module
        UNWIND module.lessons AS lesson
        MERGE (l:Lesson {id: apoc.text.base64Encode(course.slug +'--'+ module.slug +'--'+ lesson.slug) })
        SET
            l.slug = lesson.slug,
            l.type = lesson.type,
            l.title = lesson.title,
            l.order = toInteger(lesson.order),
            l.duration = lesson.duration,
            l.sandbox = lesson.sandbox,
            l.cypher = lesson.cypher,
            l.verify = lesson.verify,
            l.status = 'active',
            l.updatedAt = datetime()

        REMOVE l:DeletedLesson

        FOREACH (r IN [ (l)-[r:NEXT_LESSON]->() | r ] | DELETE r)

        MERGE (m)-[:HAS_LESSON]->(l)

        WITH c, m, l ORDER BY m.order ASC, l.order ASC
        WITH c, m, collect(l) AS lessons


        // Build Linked Lists
        WITH c, m, lessons, lessons[0] AS first, lessons[size(lessons)-1] AS last
        MERGE (m)-[:FIRST_LESSON]->(first)
        MERGE (m)-[:LAST_LESSON]->(last)

        WITH c, m, lessons

        UNWIND range(0, size(lessons) - 2) AS idx
        WITH c, m, lessons[idx] AS this, lessons[idx+1] AS next
        MERGE (this)-[:NEXT_LESSON]->(next)

        WITH c, collect(distinct m) AS modules
        WITH c, modules, modules[0] AS first
        MERGE (c)-[:FIRST_MODULE]->(first)

        WITH c, modules


        UNWIND range(0, size(modules) - 2) AS idx
        WITH c, modules[idx] AS this, modules[idx+1] AS next
        MERGE (this)-[:NEXT_MODULE]->(next)

        WITH c, this, next

        MATCH (this)-[:LAST_LESSON]->(last)
        MATCH (next)-[:FIRST_LESSON]->(first)

        MERGE (last)-[:NEXT_LESSON]->(first)
    `, { courses }))
        .then(res => console.log(res))
        .then(() => close())