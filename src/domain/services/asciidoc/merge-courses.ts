import path from 'path'
import fs from 'fs'
import { ATTRIBUTE_CAPTION, ATTRIBUTE_CATEGORIES, ATTRIBUTE_NEXT, ATTRIBUTE_PREVIOUS, ATTRIBUTE_REDIRECT, ATTRIBUTE_STATUS, ATTRIBUTE_THUMBNAIL, ATTRIBUTE_USECASE, ATTRIBUTE_VIDEO, Course, STATUS_DISABLED } from '../../model/course';
import { ASCIIDOC_DIRECTORY, DEFAULT_COURSE_STATUS, DEFAULT_COURSE_THUMBNAIL } from '../../../constants'
import { loadFile } from '../../../modules/asciidoc'
import { ATTRIBUTE_ORDER, Module } from '../../model/module';
import { ATTRIBUTE_DURATION, ATTRIBUTE_SANDBOX, ATTRIBUTE_TYPE, Lesson, LESSON_TYPE_DEFAULT, } from '../../model/lesson';
import { Question } from '../../model/question';
import { write } from '../../../modules/neo4j';

interface CourseToImport extends Partial<Course> {
    prerequisiteSlugs: string[];
    progressToSlugs: string[];
}

const loadCourses = (): CourseToImport[] => {
    const courseDirectory = path.join(ASCIIDOC_DIRECTORY, 'courses')

    return fs.readdirSync( courseDirectory )
        .filter(folder => fs.existsSync(path.join(ASCIIDOC_DIRECTORY, 'courses', folder, 'course.adoc')))
        .map(slug => loadCourse( path.join('courses', slug) ))
}

const loadCourse = (courseFolder: string): CourseToImport => {
    const slug = courseFolder.split('/').filter(a => !!a).pop() as string
    const file = loadFile(path.join(courseFolder, 'course.adoc'))

    const moduleDir = path.join(ASCIIDOC_DIRECTORY, courseFolder, 'modules')
    const modules = fs.existsSync(moduleDir)
        ? fs.readdirSync(moduleDir)
            .filter(item => fs.existsSync(path.join(moduleDir, item, 'module.adoc')))
            .map(item => loadModule(path.join(courseFolder, 'modules', item)))
        : []

    const categories = file.getAttribute(ATTRIBUTE_CATEGORIES, '')
        .split(',')
        .map((e: string) => e?.trim() || '')
        .filter((e: string) => e !== '')
        .map((entry: string) => entry.split(':'))
        // @ts-ignore
        .map(([category, order]) => ({ order: order || '1', category: category?.trim() }))

    const prerequisiteSlugs = file.getAttribute(ATTRIBUTE_PREVIOUS, '')
        .split(',')
        .map((e: string) => e?.trim() || '')
        .filter((e: string) => e !== '')

    const progressToSlugs = file.getAttribute(ATTRIBUTE_NEXT, '')
        .split(',')
        .map((e: string) => e?.trim() || '')
        .filter((e: string) => e !== '')

    return {
        slug,
        link: `/courses/${slug}/`,
        title: file.getTitle() as string,
        status: file.getAttribute(ATTRIBUTE_STATUS, DEFAULT_COURSE_STATUS),
        thumbnail: file.getAttribute(ATTRIBUTE_THUMBNAIL, DEFAULT_COURSE_THUMBNAIL),
        caption: file.getAttribute(ATTRIBUTE_CAPTION, null),
        video: file.getAttribute(ATTRIBUTE_VIDEO, null),
        usecase: file.getAttribute(ATTRIBUTE_USECASE, null),
        redirect: file.getAttribute(ATTRIBUTE_REDIRECT, null),
        duration: file.getAttribute(ATTRIBUTE_DURATION, null),
        prerequisiteSlugs,
        progressToSlugs,
        categories,
        modules,
    }
}

const loadModule = (folder: string): Module => {
    const slug = folder.split('/').filter(a => !!a).pop() as string
    const file = loadFile(path.join(folder, 'module.adoc'))

    const lessonsDir = path.join(ASCIIDOC_DIRECTORY, folder, 'lessons')

    const lessons = fs.existsSync(lessonsDir)
        ? fs.readdirSync(lessonsDir)
            .filter(filename => fs.lstatSync(path.join(lessonsDir, filename)).isDirectory() && fs.existsSync(path.join(lessonsDir, filename, 'lesson.adoc')))
            .map(filename => loadLesson(path.join(folder, 'lessons', filename)))
            .sort((a, b) => a.order > b.order ? -1 : 1)
        : []

    return {
        path: path.join(folder, 'module.adoc'),
        slug,
        title: file.getTitle() as string,
        order: file.getAttribute(ATTRIBUTE_ORDER, null),
        lessons,
    }
}

const loadLesson = (folder: string): Lesson => {
    const slug = folder.split('/').filter(a => !!a).pop()! as string
    const file = loadFile(path.join(folder, 'lesson.adoc'))

    // Load questions and answers into database
    const questionsDir = path.join(ASCIIDOC_DIRECTORY, folder, 'questions')
    const questions = fs.existsSync( questionsDir ) ?
        fs.readdirSync(questionsDir)
            .filter(filename => filename.endsWith('.adoc'))
            .map(filename => loadQuestion(path.join(folder, 'questions', filename)))
        : []

    return {
        path: folder,
        slug,
        title: file.getTitle(),
        type: file.getAttribute(ATTRIBUTE_TYPE, LESSON_TYPE_DEFAULT),
        order: file.getAttribute(ATTRIBUTE_ORDER, null),
        duration: file.getAttribute(ATTRIBUTE_DURATION, null),
        sandbox: file.getAttribute(ATTRIBUTE_SANDBOX, false),
        questions,
    } as Lesson
}

const generateQuestionId = (title: string): string => {
    return '_'+ title.replace(/(<([^>]+)>)/gi, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+$/g, '')
}

const loadQuestion = (filepath: string): Question => {
    const file = loadFile(filepath)

    const id = file.getAttribute('id', generateQuestionId(file.getTitle()!))

    return {
        id,
        text: file.getTitle(),
    } as Question

}

export async function mergeCourses(): Promise<void> {
    const courses = loadCourses()

    // Disable all courses
    await write(`
        MATCH (c:Course) SET c.status = $status
    `, { status: STATUS_DISABLED })

    // Import the courses that exist in the array
    await write(`
        UNWIND $courses AS course
        MERGE (c:Course {slug: course.slug })
        SET
            c.id = apoc.text.base64Encode(course.slug),
            c.title = course.title,
            c.thumbnail = course.thumbnail,
            c.caption = course.caption,
            c.status = course.status,
            c.usecase = course.usecase,
            c.redirect = course.redirect,
            c.duration = course.duration,
            c.video = course.video,
            c.link = '/courses/'+ c.slug +'/',
            c.updatedAt = datetime()

        // Assign Categories
        FOREACH (r in [ (c)-[r:IN_CATEGORY]->() | r] | DELETE r)

        FOREACH (row IN course.categories |
            MERGE (ct:Category {id: apoc.text.base64Encode(row.category)})
            MERGE (c)-[r:IN_CATEGORY]->(ct)
            SET r.order = row.order
        )

        // Previous courses
        FOREACH (slug IN course.prerequisiteSlugs |
            MERGE (prev:Course {slug: slug}) ON CREATE SET c.status = $STATUS_DISABLED
            MERGE (c)-[:PREREQUISITE]->(prev)
        )

        // Next courses
        FOREACH (slug IN course.progressToSlugs |
            MERGE (next:Course {slug: slug}) ON CREATE SET c.status = $STATUS_DISABLED
            MERGE (c)<-[:PREREQUISITE]-(next)
        )

        // Set old modules to "deleted"
        FOREACH (m IN [ (c)-[:HAS_MODULE]->(m) | m ] |
            SET m:DeletedModule
        )

        FOREACH (r IN [ (m)-[r:HAS_MODULE|FIRST_MODULE]->() | r ] |
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
            m.link = '/courses/'+ c.slug + '/'+ m.slug +'/',
            m.updatedAt = datetime()

        // Restore current modules
        REMOVE m:DeletedModule

        MERGE (c)-[:HAS_MODULE]->(m)

        // Delete Next Module
        FOREACH (r IN [ (m)-[r:NEXT_MODULE]-() | r ] | DELETE r)

        // Set old lessons to "deleted"
        FOREACH (l IN [ (m)-[:HAS_LESSON]->(l) | l ] |
            SET l:DeletedLesson
        )

        // Detach old lessons
        FOREACH (r IN [ (m)-[r:HAS_LESSON|FIRST_LESSON|LAST_LESSON]->() | r ] |
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
            l.link = '/courses/'+ c.slug + '/'+ m.slug +'/'+ l.slug +'/',
            l.updatedAt = datetime()

        REMOVE l:DeletedLesson

        MERGE (m)-[:HAS_LESSON]->(l)

        FOREACH (r IN [ (l)-[r:NEXT]-() | r ] | DELETE r)


        // Load Questions
        FOREACH (q IN [ (l)-[:HAS_QUESTION]->(q) | q ] |
            SET q:DeletedQuestion
        )

        FOREACH (r IN [ (l)-[r:HAS_QUESTION]->() | r ] |
            DELETE r
        )

        FOREACH (question IN lesson.questions |
            MERGE (q:Question {id: apoc.text.base64Encode(l.id +'--'+ question.id)})
            SET q.slug = question.id, q.text = question.text
            REMOVE q:DeletedQuestion
            MERGE (l)-[:HAS_QUESTION]->(q)
        )

        WITH c, m, l ORDER BY l.order ASC
        WITH c, m, collect(l) AS lessons
        CALL apoc.nodes.link(lessons, 'NEXT')

        WITH c, m, lessons, lessons[0] as first, lessons[ size(lessons)-1 ] AS last
        MERGE (m)-[:FIRST_LESSON]->(first)
        MERGE (m)-[:NEXT]->(first)
        MERGE (m)-[:LAST_LESSON]->(last)

        WITH c, m ORDER BY m.order ASC
        WITH c, collect(m) AS modules

        CALL apoc.nodes.link(modules, 'NEXT_MODULE')

        WITH c, modules[0] AS first
        MERGE (c)-[:FIRST_MODULE]->(first)

        WITH c
        MATCH (c)-[:HAS_MODULE]->(m)-[:LAST_LESSON]->(last),
            (m)-[:NEXT_MODULE]->(next)
        MERGE (last)-[:NEXT]->(next)


        WITH c
        MATCH p = (c)-[:FIRST_MODULE]->()-[:NEXT*]->(end)
        WHERE not (end)-[:NEXT]->()

        WITH c, nodes(p) as nodes, size(nodes(p)) AS size

        UNWIND range(0, size(nodes)-1) AS idx
        WITH size, idx, nodes[idx] AS node
        WHERE NOT node:Course

        SET node.progressPercentage = round((1.0 * idx / size) * 100)
    `, { courses, STATUS_DISABLED })

    /* tslint:disable-next-line */
    console.log(`📚 ${courses.length} Courses merged into graph`);
}