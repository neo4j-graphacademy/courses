/* tslint:disable:no-console */
import { getDriver } from '../modules/neo4j';
import { checkSchema, disableAllCourses, mergeCourseDetails, mergeLessonDetails, mergeModuleDetails, mergeQuestionDetails } from './tx';
import load from './load';

export async function syncCourses(): Promise<void> {
    const { courses, modules, lessons, questions } = await load()

    const driver = getDriver()
    const session = driver.session()

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
