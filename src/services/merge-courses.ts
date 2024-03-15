/* tslint:disable:no-console */
import path, { parse } from 'path'
import fs from 'fs'
import { Session, ManagedTransaction } from 'neo4j-driver';
import { loadFile } from '../modules/asciidoc'
import { getDriver } from '../modules/neo4j';
import { CourseToImport, LessonToImport, ModuleToImport, QuestionToImport } from '../types';
import { ASCIIDOC_DIRECTORY, ATTRIBUTE_CAPTION, ATTRIBUTE_CATEGORIES, ATTRIBUTE_CERTIFICATION, ATTRIBUTE_CLASSMARKER_ID, ATTRIBUTE_CLASSMARKER_REFERENCE, ATTRIBUTE_DISABLE_CACHE, ATTRIBUTE_DURATION, ATTRIBUTE_LAB, ATTRIBUTE_LANGUAGE, ATTRIBUTE_NEXT, ATTRIBUTE_OPTIONAL, ATTRIBUTE_REDIRECT, ATTRIBUTE_REPOSITORY, ATTRIBUTE_SANDBOX, ATTRIBUTE_STATUS, ATTRIBUTE_THUMBNAIL, ATTRIBUTE_TRANSLATIONS, ATTRIBUTE_REWARD_FORM, ATTRIBUTE_REWARD_IMAGE, ATTRIBUTE_REWARD_PRODUCT_ID, ATTRIBUTE_REWARD_PROVIDER, ATTRIBUTE_TYPE, ATTRIBUTE_UPDATED_AT, ATTRIBUTE_USECASE, ATTRIBUTE_VIDEO, COURSE_DIRECTORY, DEFAULT_COURSE_STATUS, DEFAULT_COURSE_THUMBNAIL, DEFAULT_LANGUAGE, DEFAULT_LESSON_TYPE, STATUS_DISABLED, ATTRIBUTE_REWARD_TYPE, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_QUESTIONS, ATTRIBUTE_PASS_PERCENTAGE, ATTRIBUTE_KEY_POINTS, ATTRIBUTE_BRANCH, ATTRIBUTE_ALLOW_LLM_CALLS } from '../constants';
import { courseOverviewPath, getDateAttribute, getOrderAttribute } from '../utils';

const loadCourses = (): CourseToImport[] => {
    return fs.readdirSync(COURSE_DIRECTORY)
        .filter(slug => fs.existsSync(courseOverviewPath(slug)))
        .map(slug => loadCourse(path.join('courses', slug)))
}

const loadCourse = (courseFolder: string): CourseToImport => {
    const slug = courseFolder.split(path.sep).filter(a => !!a).pop() as string
    const file = loadFile(courseOverviewPath(slug), { parse_header_only: true })

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

    const language = file.getAttribute(ATTRIBUTE_LANGUAGE, DEFAULT_LANGUAGE)
    const translationSlugs = file.getAttribute(ATTRIBUTE_TRANSLATIONS, '')
        .split(',')
        .filter((e: string) => e !== '')

    // Certification?
    const certification = file.getAttribute(ATTRIBUTE_CERTIFICATION, 'false') === 'true'

    // Key points for
    let keyPoints = file.getAttribute(ATTRIBUTE_KEY_POINTS, null)
    if (typeof keyPoints === 'string') {
        keyPoints = keyPoints.split(',').map(text => text.trim())
    }

    // Repository & branch
    const repository = file.getAttribute(ATTRIBUTE_REPOSITORY, null)
    const branch = repository !== undefined ? file.getAttribute(ATTRIBUTE_BRANCH, 'main') : undefined

    // @ts-ignore
    return {
        slug,
        link: `/courses/${slug}/`,
        language,
        translationSlugs,
        title: file.getTitle() as string,
        status: file.getAttribute(ATTRIBUTE_STATUS, DEFAULT_COURSE_STATUS),
        thumbnail: file.getAttribute(ATTRIBUTE_THUMBNAIL, DEFAULT_COURSE_THUMBNAIL),
        caption: file.getAttribute(ATTRIBUTE_CAPTION, null),
        video: file.getAttribute(ATTRIBUTE_VIDEO, null),
        usecase: file.getAttribute(ATTRIBUTE_USECASE, null),
        redirect: file.getAttribute(ATTRIBUTE_REDIRECT, null),
        duration: file.getAttribute(ATTRIBUTE_DURATION, null),
        repository,
        branch,
        certification,
        classmarkerId: file.getAttribute(ATTRIBUTE_CLASSMARKER_ID, null),
        classmarkerReference: file.getAttribute(ATTRIBUTE_CLASSMARKER_REFERENCE, null),
        questions: file.getAttribute(ATTRIBUTE_QUESTIONS, null),
        passPercentage: file.getAttribute(ATTRIBUTE_PASS_PERCENTAGE, null),
        allowsLLMCalls: file.getAttribute(ATTRIBUTE_ALLOW_LLM_CALLS, 'false') === 'true',
        attributes: {
            rewardType: file.getAttribute(ATTRIBUTE_REWARD_TYPE, null),
            rewardForm: file.getAttribute(ATTRIBUTE_REWARD_FORM, null),
            rewardImage: file.getAttribute(ATTRIBUTE_REWARD_IMAGE, null),
            rewardProvider: file.getAttribute(ATTRIBUTE_REWARD_PROVIDER, null),
            rewardProductId: file.getAttribute(ATTRIBUTE_REWARD_PRODUCT_ID, null),
            keyPoints,
            ...attributes,
        },
        progressToSlugs,
        categories,
        modules: modules.map((module) => ({
            ...module,
        })),
    }
}

const loadModule = (folder: string): ModuleToImport => {
    const slug = folder.split(path.sep).filter(a => !!a).pop() as string
    const file = loadFile(path.join(ASCIIDOC_DIRECTORY, folder, 'module.adoc'), { parse_header_only: true })

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
        description: file.getAttribute(ATTRIBUTE_DESCRIPTION),
        order,
        lessons: lessons.map((lesson) => ({
            ...lesson,
        })),
    }
}

const loadLesson = (folder: string): LessonToImport => {
    const slug = folder.split(path.sep).filter(a => !!a).pop()! as string
    const file = loadFile(path.join(ASCIIDOC_DIRECTORY, folder, 'lesson.adoc'), { parse_header_only: true })

    // Load questions and answers into database
    const questionsDir = path.join(ASCIIDOC_DIRECTORY, folder, 'questions')
    const questions = fs.existsSync(questionsDir) ?
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
        type: file.getAttribute(ATTRIBUTE_TYPE, DEFAULT_LESSON_TYPE),
        order,
        duration: file.getAttribute(ATTRIBUTE_DURATION, null),
        sandbox: file.getAttribute(ATTRIBUTE_SANDBOX, false),
        lab: file.getAttribute(ATTRIBUTE_LAB, false),
        optional: file.getAttribute(ATTRIBUTE_OPTIONAL, false) === 'true',
        disableCache: file.getAttribute(ATTRIBUTE_DISABLE_CACHE, false) === 'true',
        questions,
        updatedAt,
    } as LessonToImport
}

const generateQuestionId = (title: string): string => {
    return '_' + title.replace(/(<([^>]+)>)/gi, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+$/g, '')
}

const loadQuestion = (filepath: string): QuestionToImport => {
    const parsed = parse(filepath)
    const file = loadFile(path.join(ASCIIDOC_DIRECTORY, filepath), { parse_header_only: true })
    const id = file.getAttribute('id', generateQuestionId(file.getTitle()!))

    return {
        id,
        filename: parsed.base,
        text: file.getTitle(),
    } as QuestionToImport
}


/**
 * Transaction Functions
 */
const disableAllCourses = (tx: ManagedTransaction, valid: string[]) => tx.run(`
    MATCH (c:Course)
    WHERE NOT c.slug IN $valid
    SET c.status = $status
`, { valid, status: STATUS_DISABLED })

const mergeCourseDetails = (tx: ManagedTransaction, courses: CourseToImport[]) => {
    tx.run(`
        UNWIND $courses AS course
        MERGE (c:Course {slug: course.slug})
        SET
            c.id = apoc.text.base64Encode(course.link),
            c.title = course.title,
            c.language = course.language,
            c.thumbnail = course.thumbnail,
            c.caption = course.caption,
            c.status = course.status,
            c.usecase = course.usecase,
            c.redirect = course.redirect,
            c.duration = course.duration,
            c.repository = course.repository,
            c.branch = course.branch,
            c.video = course.video,
            c.link = '/courses/'+ c.slug +'/',
            c.updatedAt = datetime(),
            c.classmarkerId = course.classmarkerId,
            c.classmarkerReference = course.classmarkerReference,
            c.questions = toInteger(course.questions),
            c.passPercentage = toInteger(course.passPercentage),
            c.allowsLLMCalls = course.allowsLLMCalls,
            c += course.attributes

        FOREACH (_ IN CASE WHEN course.certification THEN [1] ELSE [] END | SET c:Certification)
        FOREACH (r IN [(c)-[r:IN_CATEGORY]->(n) WHERE NOT n.slug IN [ x IN course.categories | x.category ] | r] | DELETE r)
        FOREACH (r IN [(c)-[r:HAS_TRANSLATION]->(n) WHERE NOT n.slug IN course.translations | r] | DELETE r)
        FOREACH (r IN [(c)-[r:PROGRESS_TO]->(n) WHERE NOT n.slug IN course.progressToSlugs | r] | DELETE r)

        WITH c, course

        UNWIND course.categories AS row
        MERGE (cat:Category {id: apoc.text.base64Encode(row.category)})
        MERGE (c)-[r:IN_CATEGORY]->(cat)
        SET r.order = toInteger(row.order)

        // Set all modules to deleted and detach
        FOREACH (m IN [ (c)-[:HAS_MODULE]->(m) | m ] | SET m:DeletedModule )
        FOREACH (r IN [ (c)-[r:HAS_MODULE]->() | r ] | DELETE r )
    `, { courses })

    // Translations
    tx.run(`
        UNWIND $courses AS course
        MATCH (c:Course {slug: course.slug})

        FOREACH (slug IN course.translationSlugs |
            MERGE (t:Course {slug: slug})
            MERGE (c)-[:HAS_TRANSLATION]->(t)
        )
    `, { courses })

    // Next Courses
    tx.run(`
        UNWIND $courses AS course
        MATCH (c:Course {slug: course.slug})

        FOREACH (slug IN course.progressToSlugs |
            MERGE (t:Course {slug: slug})
            MERGE (c)-[:PROGRESS_TO]->(t)
        )
    `, { courses })
}

const mergeModuleDetails = (tx: ManagedTransaction, modules: any) => tx.run(`
    UNWIND $modules AS module
        MATCH (c:Course {slug: module.courseSlug})

    MERGE (m:Module {id: apoc.text.base64Encode(module.link) })
    SET
        m.title = module.title,
        m.slug = module.slug,
        m.description = module.description,
        m.order = toInteger(module.order),
        m.status = 'active',
        m.duration = module.duration,
        m.link = '/courses/'+ c.slug + '/'+ module.slug +'/',
        m.updatedAt = datetime()

    // Restore current modules
    REMOVE m:DeletedModule

    MERGE (c)-[:HAS_MODULE]->(m)

    // Set lessons to deleted and detach
    FOREACH (m IN [ (m)-[:HAS_LESSON]->(l) | l ] | SET m:DeletedLesson )
    FOREACH (r IN [ (m)-[r:HAS_LESSON]->() | r ] | DELETE r )

`, { modules })

const mergeLessonDetails = (tx: ManagedTransaction, lessons: any) => tx.run(`
    UNWIND $lessons AS lesson
        MATCH (m:Module {link: lesson.moduleLink})

    MERGE (l:Lesson {id: apoc.text.base64Encode(lesson.link) })
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
        l.lab = lesson.lab,
        l.link = m.link + lesson.slug +'/',
        l.disableCache = lesson.disableCache,
        l.updatedAt = CASE WHEN lesson.updatedAt IS NOT NULL THEN datetime(lesson.updatedAt) ELSE null END

    REMOVE l:DeletedLesson

    FOREACH (_ IN CASE WHEN lesson.optional THEN [1] ELSE [] END |
        SET l:OptionalLesson
    )

    FOREACH (_ IN CASE WHEN lesson.optional = false THEN [1] ELSE [] END |
        REMOVE l:OptionalLesson
    )

    MERGE (m)-[:HAS_LESSON]->(l)

    // Clean up questions
    FOREACH (q IN [ (l)-[:HAS_QUESTION]->(q) | q ] |
        SET q:DeletedQuestion
    )

    // Detach question
    FOREACH (r IN [ (l)-[r:HAS_QUESTION]->() | r ] |
        DELETE r
    )
`, { lessons })

const mergeQuestionDetails = (tx: ManagedTransaction, questions: any) => tx.run(`
    UNWIND $questions AS question
    MATCH (l:Lesson {link: question.lessonLink})

    MERGE (q:Question {id: apoc.text.base64Encode(l.id +'--'+ question.id)})
    SET q.slug = question.id, q.text = question.text, q.filename = question.filename

    REMOVE q:DeletedQuestion
    MERGE (l)-[:HAS_QUESTION]->(q)
`, { questions })



// Integrity Checks
const checkSchema = (session: Session) => session.readTransaction(async tx => {
    // Next Links?
    const next = await tx.run(`
        MATCH (a)-[:NEXT]->(b)
        WITH a, b, count(*) AS count

        WHERE count > 1

        RETURN *
    `)

    if (next.records.length > 1) {
        throw new Error(`Too many next links: \n ${JSON.stringify(next.records.map(row => row.toObject()), null, 2)}`)
    }
})

export async function mergeCourses(): Promise<void> {
    const courses = loadCourses()

    const driver = getDriver()
    const session = driver.session()

    const modules = courses.flatMap(course => course.modules?.flatMap(module => ({
        courseSlug: course.slug,
        link: `/courses/${course.slug}/${module.slug}/`,
        ...module,
    })))

    const lessons = modules.flatMap(module => module?.lessons.map(lesson => ({
        courseSlug: module.courseSlug,
        moduleSlug: module.slug,
        moduleLink: `/courses/${module.courseSlug}/${module.slug}/`,
        link: `/courses/${module.courseSlug}/${module.slug}/${lesson.slug}/`,
        ...lesson,
    })))

    const questions = lessons.flatMap(lesson => lesson?.questions.map(question => ({
        lessonLink: `${lesson.moduleLink}${lesson.slug}/`,
        ...question,
    })))

    const courseCount = await session.executeWrite(async tx => {
        // Disable all courses
        const valid = courses.map(course => course.slug!)
        await disableAllCourses(tx, valid)

        await mergeCourseDetails(tx, courses)

        return courses.length
    })
    console.log(`📚 ${courseCount} Courses merged into graph`);


    const moduleCount = await session.executeWrite(async tx => {
        await mergeModuleDetails(tx, modules)

        return modules.length
    })
    console.log(`   -- 📦 ${moduleCount} modules`);


    const lessonCount = await session.executeWrite(async tx => {
        const remaining = lessons.slice(0)
        const batchSize = 100

        while (remaining.length) {
            const batch = remaining.splice(0, batchSize)

            await mergeLessonDetails(tx, batch)
        }

        return lessons.length
    })
    console.log(`   -- 📄 ${lessonCount} lessons`);


    const questionCount = await session.executeWrite(async tx => {
        const remaining = questions.slice(0)
        const batchSize = 1000

        while (remaining.length) {
            const batch = remaining.splice(0, batchSize)

            await mergeQuestionDetails(tx, batch)
        }

        return questions.length
    })

    console.log(`   -- 🤨 ${questionCount} questions`);


    // Clean {FIRST|LAST}_{MODULE|LESSON}
    await session.executeWrite(async tx => {
        // Recreate (:Lesson) NEXT chain
        await tx.run(`
            MATCH ()-[r:FIRST_LESSON|LAST_LESSON|FIRST_MODULE|LAST_MODULE]->()
            DELETE r
        `)
    })
    console.log(`   -- Removed -[:FIRST_LESSON|LAST_LESSON|FIRST_MODULE|LAST_MODULE]-> chain`);

    // Clean NEXT chain
    await session.executeWrite(async tx => {
        // Recreate (:Lesson) NEXT chain
        await tx.run(`
            MATCH ()-[r:NEXT]->()
            DELETE r
        `)
    })
    console.log(`   -- Removed -[:NEXT]-> chain`);

    await session.executeWrite(async tx => {
        const remaining = courses.slice(0).map(course => course.slug)
        const batchSize = 10

        while (remaining.length) {
            const batch = remaining.splice(0, batchSize)

            // Recreate (:Module) NEXT chain
            await tx.run(`
                MATCH (c:Course)-[:HAS_MODULE]->(m)
                WHERE c.slug IN $batch
                WITH c, m ORDER BY m.order ASC
                WITH c, collect(m) AS modules

                WITH c, modules, modules[0] AS first, modules[-1] AS last
                MERGE (c)-[:FIRST_MODULE]->(first)
                MERGE (c)-[:LAST_MODULE]->(last)

                WITH modules
                UNWIND range(0, size(modules)-2) AS idx
                WITH modules[idx] AS last, modules[idx+1] AS next
                MERGE (last)-[:NEXT_MODULE]->(next)
            `, { batch })
        }
    })
    console.log(`   -- Recreated (:Module)-[:NEXT_MODULE]->() chain`);

    await session.executeWrite(async tx => {
        const remaining = modules.slice(0).map(module => module!.link)
        const batchSize = 1000

        while (remaining.length) {
            const batch = remaining.splice(0, batchSize)

            // Recreate (:Lesson) NEXT chain
            await tx.run(`
                MATCH (m:Module)-[:HAS_LESSON]->(l)
                WHERE m.link IN $batch
                WITH m, l ORDER BY l.order ASC
                WITH m, collect(l) AS lessons

                WITH m, lessons, lessons[0] AS first, lessons[-1] AS last

                MERGE (m)-[:NEXT]->(first)
                MERGE (m)-[:FIRST_LESSON]->(first)
                MERGE (m)-[:LAST_LESSON]->(last)

                WITH *

                UNWIND range(0, size(lessons)-2) AS idx
                WITH lessons[idx] AS last, lessons[idx+1] AS next
                MERGE (last)-[:NEXT]->(next)

                RETURN *

            `, { batch })
        }
    })
    console.log(`   -- Recreated (:Lesson) NEXT chain`);


    await session.executeWrite(async tx => {
        // Create -[:NEXT]-> between last (:Lesson) and next (:Module)
        await tx.run(`
            MATCH (last:Lesson)<-[:LAST_LESSON]-()-[:NEXT_MODULE]->(next)
            MERGE (last)-[:NEXT]->(next)
        `)
    })
    console.log(`   -- Recreated (:Module)-[:NEXT]->(:Lesson)`);

    await session.executeWrite(async tx => {
        const remaining = courses.slice(0).map(course => course.slug)
        const batchSize = 100

        while (remaining.length) {
            const batch = remaining.splice(0, batchSize)

            // Calculate progressPercentage
            await tx.run(`
                MATCH p = (c:Course)-[:FIRST_MODULE]->()-[:NEXT*..200]->(end:Lesson)
                WHERE c.slug IN $batch
                AND NOT (end)-[:NEXT]->()
                WITH c, nodes(p) AS nodes, size(nodes(p)) AS size

                UNWIND range(0, size(nodes)-1) AS idx
                WITH size, idx, nodes[idx] AS node
                WHERE NOT node:Course

                SET node.progressPercentage = round((1.0 * idx / size) * 100)
            `, { batch })
        }
    })
    console.log(`   -- Calculated progressPercentage`);


    // Integrity Checks
    await checkSchema(session)
}
