import path from 'path'
import fs from 'fs'
import { ATTRIBUTE_CAPTION, ATTRIBUTE_CATEGORIES, ATTRIBUTE_LANGUAGE, ATTRIBUTE_NEXT, ATTRIBUTE_PREVIOUS, ATTRIBUTE_REDIRECT, ATTRIBUTE_STATUS, ATTRIBUTE_THUMBNAIL, ATTRIBUTE_TRANSLATIONS, ATTRIBUTE_USECASE, ATTRIBUTE_VIDEO, Course, LANGUAGE_EN, STATUS_DISABLED } from '../../model/course';
import { ASCIIDOC_DIRECTORY, DEFAULT_COURSE_STATUS, DEFAULT_COURSE_THUMBNAIL } from '../../../constants'
import { loadFile } from '../../../modules/asciidoc'
import { ATTRIBUTE_ORDER, Module } from '../../model/module';
import { ATTRIBUTE_DURATION, ATTRIBUTE_REPOSITORY, ATTRIBUTE_SANDBOX, ATTRIBUTE_TYPE, ATTRIBUTE_OPTIONAL, Lesson, LESSON_TYPE_DEFAULT, ATTRIBUTE_DISABLE_CACHE, ATTRIBUTE_UPDATED_AT, } from '../../model/lesson';
import { Question } from '../../model/question';
import { getDriver, write } from '../../../modules/neo4j';
import { Asciidoctor } from '@asciidoctor/core/types';
import { Session, Transaction } from 'neo4j-driver';

interface CourseToImport extends Partial<Course> {
    attributes: Record<string, any>;
    prerequisiteSlugs: string[];
    progressToSlugs: string[];
}

/**
 * Attributes or folder slugs used to determine the order
 * are converted into a string so they can be compared
 */
type LessonToImport = Omit<Lesson, 'order'> & { order: string, updatedAt: string }
type ModuleToImport = Omit<Module, 'order'> & { order: string }

const padOrder = (order: string | number): string => {
    return ('0000'+ order).slice(-4)
}

const getOrderAttribute = (folder: string, file: Asciidoctor.Document): string => {
    let order = file.getAttribute(ATTRIBUTE_ORDER, null)

    if ( typeof order === 'string' ) {
        order = padOrder(order)
    }

    // If order is undefined, use the first part of folder name to order
    // eg: 1-first or 10-tenth
    if ( order === undefined ) {
        const folderParts = folder.split('/')
        const folderName = folderParts[ folderParts.length -1 ]

        const orderParts = folderName.split('-')
        order = padOrder(orderParts[0])
    }

    return order
}

const getDateAttribute = (file: Asciidoctor.Document, attribute: string): string | undefined => {
    const date = file.getAttribute(attribute)

    return date !== undefined ? new Date(date.replace(/\s/g, '')).toISOString() : undefined
}

const loadCourses = (): CourseToImport[] => {
    const courseDirectory = path.join(ASCIIDOC_DIRECTORY, 'courses')

    return fs.readdirSync( courseDirectory )
        .filter(folder => fs.existsSync(path.join(ASCIIDOC_DIRECTORY, 'courses', folder, 'course.adoc')))
        .map(slug => loadCourse( path.join('courses', slug) ))
}

const loadCourse = (courseFolder: string): CourseToImport => {
    const slug = courseFolder.split('/').filter(a => !!a).pop() as string
    const file = loadFile(path.join(courseFolder, 'course.adoc'), {parse_header_only: true})

    const moduleDir = path.join(ASCIIDOC_DIRECTORY, courseFolder, 'modules')
    const modules = fs.existsSync(moduleDir)
        ? fs.readdirSync(moduleDir)
            .filter(item => fs.existsSync(path.join(moduleDir, item, 'module.adoc')))
            .map(item => loadModule(path.join(courseFolder, 'modules', item)))
        : []

    // Sort Modules
    modules.sort((a, b) => a.order < b.order ? -1 : 1)

    const categories = file.getAttribute(ATTRIBUTE_CATEGORIES, '')
        .split(',')
        .map((e: string) => e?.trim() || '')
        .filter((e: string) => e !== '')
        .map((entry: string) => entry.split(':'))
        // @ts-ignore
        .map(([category, order]) => ({ order: order || '1', category: category?.trim() }))

    const progressToSlugs = file.getAttribute(ATTRIBUTE_NEXT, '')
        .split(',')
        .map((e: string) => e?.trim() || '')
        .filter((e: string) => e !== '')

    // Extract additional properties from course asciidoc attributes
    // (ends with repository, eg :cypher-repository:)
    const attributes = Object.fromEntries(
        Object.entries(file.getAttributes())
            .filter(([key]) => key.endsWith('repository'))
    )

    const language = file.getAttribute(ATTRIBUTE_LANGUAGE, LANGUAGE_EN)
    const translations = file.getAttribute(ATTRIBUTE_TRANSLATIONS, '')
        .split(',')
        .filter((e: string) => e !== '')


    // @ts-ignore
    return {
        slug,
        link: `/courses/${slug}/`,
        language,
        translations,
        title: file.getTitle() as string,
        status: file.getAttribute(ATTRIBUTE_STATUS, DEFAULT_COURSE_STATUS),
        thumbnail: file.getAttribute(ATTRIBUTE_THUMBNAIL, DEFAULT_COURSE_THUMBNAIL),
        caption: file.getAttribute(ATTRIBUTE_CAPTION, null),
        video: file.getAttribute(ATTRIBUTE_VIDEO, null),
        usecase: file.getAttribute(ATTRIBUTE_USECASE, null),
        redirect: file.getAttribute(ATTRIBUTE_REDIRECT, null),
        duration: file.getAttribute(ATTRIBUTE_DURATION, null),
        repository: file.getAttribute(ATTRIBUTE_REPOSITORY, null),
        attributes,
        progressToSlugs,
        categories,
        modules: modules.map((module, index) => ({
            ...module,
            order: index,
        })),
    }
}

const loadModule = (folder: string): ModuleToImport => {
    const slug = folder.split('/').filter(a => !!a).pop() as string
    const file = loadFile(path.join(folder, 'module.adoc'), {parse_header_only: true})

    const lessonsDir = path.join(ASCIIDOC_DIRECTORY, folder, 'lessons')

    const lessons = fs.existsSync(lessonsDir)
        ? fs.readdirSync(lessonsDir)
            .filter(filename => fs.lstatSync(path.join(lessonsDir, filename)).isDirectory() && fs.existsSync(path.join(lessonsDir, filename, 'lesson.adoc')))
            .map(filename => loadLesson(path.join(folder, 'lessons', filename)))
        : []

    // Sort Lessons
    lessons.sort((a, b) => a.order < b.order ? -1 : 1)

    const order = getOrderAttribute(folder, file)

    return {
        path: path.join(folder, 'module.adoc'),
        slug,
        title: file.getTitle() as string,
        order,
        lessons: lessons.map((lesson, index) => ({
            ...lesson,
            order: index
        })),
    }
}

const loadLesson = (folder: string): LessonToImport => {
    const slug = folder.split('/').filter(a => !!a).pop()! as string
    const file = loadFile(path.join(folder, 'lesson.adoc'), {parse_header_only: true})

    // Load questions and answers into database
    const questionsDir = path.join(ASCIIDOC_DIRECTORY, folder, 'questions')
    const questions = fs.existsSync( questionsDir ) ?
        fs.readdirSync(questionsDir)
            .filter(filename => filename.endsWith('.adoc'))
            .map(filename => loadQuestion(path.join(folder, 'questions', filename)))
        : []


    const order = getOrderAttribute(folder, file)
    const updatedAt = getDateAttribute(file, ATTRIBUTE_UPDATED_AT)

    return {
        path: folder,
        slug,
        title: file.getTitle(),
        type: file.getAttribute(ATTRIBUTE_TYPE, LESSON_TYPE_DEFAULT),
        order,
        duration: file.getAttribute(ATTRIBUTE_DURATION, null),
        sandbox: file.getAttribute(ATTRIBUTE_SANDBOX, false),
        optional: file.getAttribute(ATTRIBUTE_OPTIONAL, false) === 'true',
        disableCache: file.getAttribute(ATTRIBUTE_DISABLE_CACHE, false) === 'true',
        questions,
        updatedAt,
    } as LessonToImport
}

const generateQuestionId = (title: string): string => {
    return '_'+ title.replace(/(<([^>]+)>)/gi, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+$/g, '')
}

const loadQuestion = (filepath: string): Question => {
    const file = loadFile(filepath, {parse_header_only: true})
    const id = file.getAttribute('id', generateQuestionId(file.getTitle()!))

    return {
        id,
        text: file.getTitle(),
    } as Question
}


/**
 * Transaction Functions
 */
const disableAllCourses = (tx: Transaction, valid: string[]) => tx.run(`MATCH (c:Course) WHERE NOT c.slug IN $valid SET c.status = $status`, { valid, status: STATUS_DISABLED })

const mergeCourseDetails = (session: Session, courses: CourseToImport[]) => session.writeTransaction(tx => tx.run(`
    UNWIND $courses AS course
    MERGE (c:Course {slug: course.slug})
    SET
        c.id = apoc.text.base64Encode(course.slug),
        c.title = course.title,
        c.language = course.language,
        c.thumbnail = course.thumbnail,
        c.caption = course.caption,
        c.status = course.status,
        c.usecase = course.usecase,
        c.redirect = course.redirect,
        c.duration = course.duration,
        c.repository = course.repository,
        c.video = course.video,
        c.link = '/courses/'+ c.slug +'/',
        c.updatedAt = datetime(),
        c += course.attributes

    FOREACH (r IN [(c)-[r:IN_CATEGORY]->(n) WHERE NOT n.slug IN [ x IN course.categories | x.category ] | r] | DELETE r)
    FOREACH (r IN [(c)-[r:HAS_TRANSLATION]->(n) WHERE NOT n.slug IN course.translations | r] | DELETE r)
    FOREACH (r IN [(c)-[r:PREREQUISITE]->(n) WHERE NOT n.slug IN course.progressToSlugs | r] | DELETE r)

    UNWIND course.categories AS slug
    MERGE (cat:Category {slug: slug})
    MERGE (c)-[:IN_CATEGORY]->(cat)

    // await deleteCourseRelationships(tx, course.slug!, 'IN_CATEGORY', course.categories?.map(category => category.slug))
        // await deleteCourseRelationships(tx, course.slug!, 'HAS_TRANSLATION', course.translations?.map(translation => translation.slug))
        // await deleteCourseRelationships(tx, course.slug!, 'PREREQUISITE', course.translations?.map(translation => translation.slug))
`, { courses }))



// Integrity Checks
const checkSchema = (session: Session) => session.readTransaction(async tx => {
    // Next Links?
    const next = await tx.run(`
        MATCH (a)-[:NEXT]->(b)
        WITH a, b, count(*) AS count

        WHERE count > 1

        RETURN *
    `)

    if ( next.records.length > 1 ) {
        throw new Error(`Too many next links: \n ${JSON.stringify(next.records.map(row => row.toObject()), null, 2)}`)
    }
})


const mergeModuleDetails = (session: Session, modules: Module[]) => session.writeTransaction(tx => tx.run(`
    UNWIND $modules AS module
    //     MATCH (c:Course {slug: $course.slug})

//     MERGE (m:Module {id: apoc.text.base64Encode($course.slug +'--'+ $module.slug) })
//     SET
//         m.title = $module.title,
//         m.slug = $module.slug,
//         m.order = toInteger($module.order),
//         m.status = 'active',
//         m.duration = $module.duration,
//         m.link = '/courses/'+ $course.slug + '/'+ $module.slug +'/',
//         m.updatedAt = datetime()

//     // Restore current modules
//     REMOVE m:DeletedModule

//     MERGE (c)-[:HAS_MODULE]->(m)

`, { modules }))



export async function mergeCourses(): Promise<void> {
    const courses = loadCourses()

    const driver = getDriver()
    const session = driver.session()

    const modules = courses.flatMap(course => course.modules?.flatMap(module => ({
        courseSlug: course.slug,
        ...module,
    })))

    const lessons = courses.flatMap(course => course.modules?.flatMap(module => module.lessons.map(lesson => ({
        courseSlug: course.slug,
        moduleSlug: module.slug,
        ...module,
    }))))

    const questions = courses.flatMap(course => course.modules?.flatMap(module => module.lessons.map(lesson => lesson.questions.map(question => ({
        courseSlug: course.slug,
        moduleSlug: module.slug,
        lessonSlug: lesson.slug,
        ...question,
    })))))

    // console.clear()
    // console.log(modules.length, lessons.length, questions.length, questions[0]);




    const count = await session.writeTransaction(async tx => {
        // Disable all courses
        const valid = courses.map(course => course.slug!)
        await disableAllCourses(tx, valid)

        await mergeCourseDetails(session, courses)
    })

    // await session.writeTransaction(async tx => {



    //     return courses.length
    // })

    // await session.writeTransaction(async tx => {
    //     // // Merge Course
    //     // const res = await Promise.all(courses.map(course => mergeCourse(tx, course)))

    //     // // Remove (:Module) Next chain
    //     // await tx.run(`MATCH (:Module)-[r:NEXT_MODULE|FIRST_MODULE|LAST_MODULE|NEXT]->() DELETE r`)

    //     // // Remove (:Lesson) Next chain
    //     // await tx.run(`MATCH (:Lesson)-[r:NEXT_LESSON|FIRST_LESSON|LAST_LESSON|NEXT]->() DELETE r`)


    //     // // Recreate (:Module) NEXT chain
    //     // await tx.run(`
    //     //     MATCH (c:Course)-[:HAS_MODULE]->(m)
    //     //     WITH c, m ORDER BY m.order ASC
    //     //     WITH c, collect(m) AS modules

    //     //     WITH c, modules, modules[0] AS first, modules[-1] AS last
    //     //     CALL apoc.nodes.link(modules, 'NEXT_MODULE')

    //     //     MERGE (c)-[:FIRST_MODULE]->(first)
    //     //     MERGE (c)-[:LAST_MODULE]->(last)
    //     // `)

    //     // // Recreate (:Lesson) NEXT chain
    //     // await tx.run(`
    //     //     MATCH (m:Module)-[:HAS_LESSON]->(l)
    //     //     WITH m, l ORDER BY l.order ASC
    //     //     WITH m, collect(l) AS lessons

    //     //     WITH m, lessons, lessons[0] AS first, lessons[-1] AS last
    //     //     CALL apoc.nodes.link(lessons, 'NEXT')

    //     //     MERGE (m)-[:NEXT]->(first)
    //     //     MERGE (m)-[:FIRST_LESSON]->(first)
    //     //     MERGE (m)-[:LAST_LESSON]->(last)
    //     // `)

    //     // // Create -[:NEXT]-> between last (:Lesson) and next (:Modle)
    //     // await tx.run(`
    //     //     MATCH (last:Lesson)<-[:LAST_LESSON]-()-[:NEXT_MODULE]->(next)
    //     //     MERGE (last)-[:NEXT]->(next)
    //     // `)

    //     // // Calculate progressPercentage
    //     // await tx.run(`
    //     //     MATCH p = (c:Course)-[:FIRST_MODULE]->()-[:NEXT*]->(end:Lesson)
    //     //     WHERE not (end)-[:NEXT]->()
    //     //     WITH c, nodes(p) AS nodes, size(nodes(p)) AS size

    //     //     UNWIND range(0, size(nodes)-1) AS idx
    //     //     WITH size, idx, nodes[idx] AS node
    //     //     WHERE NOT node:Course

    //     //     SET node.progressPercentage = round((1.0 * idx / size) * 100)
    //     // `)

    //     // return res.length

    //     return courses.length
    // })

    // Integrity Checks
    // await checkSchema(session)


    // console.log(`📚 ${count} Courses merged into graph`);

    return
}
