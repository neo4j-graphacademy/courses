import { ManagedTransaction, Session } from "neo4j-driver";
import { STATUS_DISABLED } from "../../constants";
import { CourseToImport } from "./load-courses";

/**
 * Transaction Functions
 */
export const disableAllCourses = (tx: ManagedTransaction, valid: string[]) =>
  tx.run(
    `
  MATCH (c:Course)
  WHERE NOT c.status IN $valid AND not c:Certification
  SET c.status = $status
`,
    { valid, status: STATUS_DISABLED },
  );

export const mergeCourseDetails = (
  tx: ManagedTransaction,
  courses: CourseToImport[],
) => {
  tx.run(
    `
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
        c.databaseProvider = course.databaseProvider,
        c.vectorOptimized = course.vectorOptimized,
        c.graphAnalyticsPlugin = course.graphAnalyticsPlugin,
        c.redirect = course.redirect,
        c.duration = course.duration,
        c.repository = course.repository,
        c.branch = course.branch,
        c.video = course.video,
        c.link = '/courses/'+ c.slug +'/',
        c.updatedAt = CASE WHEN c.hash IS NULL OR c.hash <> course.hash THEN datetime() ELSE coalesce(c.updatedAt, datetime()) END,
        c.hash = course.hash,
        c.classmarkerId = course.classmarkerId,
        c.classmarkerReference = course.classmarkerReference,
        c.questions = toInteger(course.questions),
        c.passPercentage = toInteger(course.passPercentage),
        c += course.attributes

      FOREACH (_ IN CASE WHEN course.certification THEN [1] ELSE [] END | SET c:Certification)
      FOREACH (r IN [(c)-[r:IN_CATEGORY]->(n) WHERE NOT n.slug IN [ x IN course.categories | x.category ] | r] | DELETE r)
      FOREACH (r IN [(c)-[r:PROGRESS_TO]->(n) WHERE NOT n.slug IN course.progressToSlugs | r] | DELETE r)
      FOREACH (r IN [(c)-[r:HAS_PREREQUISITE]->(n) WHERE NOT n.slug IN course.prerequisiteSlugs | r] | DELETE r)
      // Set all modules to deleted and detach
      FOREACH (m IN [ (c)-[:HAS_MODULE]->(m) | m ] | SET m:DeletedModule )
      FOREACH (r IN [ (c)-[r:HAS_MODULE]->() | r ] | DELETE r )

      WITH c, course

      CALL {
        WITH c, course

        UNWIND range(0, size(course.prerequisiteSlugs)-1) AS idx
        WITH c, course, idx, course.prerequisiteSlugs[ idx ] AS slug
        MERGE (prereq:Course {slug: slug})
        MERGE (c)-[r:HAS_PREREQUISITE]->(prereq)
        SET r.order = idx
      }

      UNWIND course.categories AS row
      MERGE (cat:Category {slug: row.category})
      MERGE (c)-[r:IN_CATEGORY]->(cat)
      SET r.order = toInteger(row.order)
  `,
    { courses },
  );

  // Translations
  tx.run(
    `
      UNWIND $courses AS course
      MATCH (c:Course {slug: course.slug})

      FOREACH (slug IN course.translationSlugs |
        MERGE (t:Course {slug: slug})
        MERGE (c)-[:HAS_TRANSLATION]->(t)
      )
  `,
    { courses },
  );

  // Next Courses
  tx.run(
    `
      UNWIND $courses AS course
      MATCH (c:Course {slug: course.slug})

      FOREACH (slug IN course.progressToSlugs |
        MERGE (t:Course {slug: slug})
        MERGE (c)-[:PROGRESS_TO]->(t)
      )
  `,
    { courses },
  );
};

export const mergeModuleDetails = (tx: ManagedTransaction, modules: any) =>
  tx.run(
    `
  UNWIND $modules AS module
    MATCH (c:Course {slug: module.course.slug})

  MERGE (m:Module {id: apoc.text.base64Encode(module.link) })
  SET
    m.title = module.title,
    m.slug = module.slug,
    m.description = module.description,
    m.order = toInteger(module.order),
    m.status = 'active',
    m.duration = module.duration,
    m.link = '/courses/'+ c.slug + '/'+ module.slug +'/',
    m.updatedAt = CASE WHEN m.hash IS NULL OR m.hash <> module.hash THEN datetime() ELSE coalesce(m.updatedAt, datetime()) END,
    m.hash = module.hash

  // Restore current modules
  REMOVE m:DeletedModule

  MERGE (c)-[:HAS_MODULE]->(m)

  // Set lessons to deleted and detach
  FOREACH (m IN [ (m)-[:HAS_LESSON]->(l) | l ] | SET m:DeletedLesson )
  FOREACH (r IN [ (m)-[r:HAS_LESSON]->() | r ] | DELETE r )

`,
    { modules },
  );

export const mergeLessonDetails = (tx: ManagedTransaction, lessons: any) =>
  tx.run(
    `
  UNWIND $lessons AS lesson
    MATCH (m:Module {link: lesson.module.link})

  MERGE (l:Lesson {id: apoc.text.base64Encode(lesson.link) })
  SET
    l.slug = lesson.slug,
    l.type = lesson.type,
    l.title = lesson.title,
    l.order = toInteger(lesson.order),
    l.duration = lesson.duration,
    l.sandbox = lesson.sandbox,
    l.chatbot = lesson.chatbot,
    l.cypher = lesson.cypher,
    l.verify = lesson.verify,
    l.slides = lesson.slides,
    l.sequential = lesson.sequential,
    l.status = 'active',
    l.lab = lesson.lab,
    l.link = m.link + lesson.slug +'/',
    l.disableCache = lesson.disableCache,
    l.updatedAt = CASE WHEN l.hash IS NULL OR l.hash <> lesson.hash THEN datetime() ELSE coalesce(l.updatedAt, datetime()) END,
    l.hash = lesson.hash

  REMOVE l:DeletedLesson

  FOREACH (_ IN CASE WHEN lesson.optional THEN [1] ELSE [] END |
    SET l:OptionalLesson
  )

  FOREACH (_ IN CASE WHEN lesson.optional = false THEN [1] ELSE [] END |
    REMOVE l:OptionalLesson
  )

  MERGE (m)-[:HAS_LESSON]->(l)

  // Detach question
  FOREACH (r IN [ (l)-[r:HAS_QUESTION]->() | r ] |
      DELETE r
  )
`,
    { lessons },
  );

export const mergeQuestionDetails = async (
  tx: ManagedTransaction,
  questions: any,
) => {
  await tx.run(
    `
  UNWIND $questions AS question
  MATCH (l:Lesson {link: question.lessonLink})

  MERGE (q:Question {id: apoc.text.base64Encode(l.id +'--'+ question.id)})
  SET
    q.slug = question.id,
    q.title = question.title,
    q.text = question.text,
    q.filename = question.filename,
    q.link = l.link + question.basename,
    q.lessonLink = l.link,
    q.type = question.type,
    q.hint = question.hint,
    q.solution = question.solution,
    q.order = toInteger(question.order)

  REMOVE q:DeletedQuestion
  MERGE (l)-[:HAS_QUESTION]->(q)

  WITH q, question, [x IN coalesce(question.answers, []) | x.id] AS validIds
  MATCH (q)-[r:HAS_ANSWER]->(a:Answer)
  WHERE NOT a.id IN validIds
  SET a:DeletedAnswer
  DELETE r
`,
    { questions },
  );

  const answerRows = questions.flatMap((q: { answers?: unknown[]; lessonLink: string; id: string }) =>
    (Array.isArray(q.answers) ? q.answers : []).map((a: any) => ({
      lessonLink: q.lessonLink,
      questionSlug: q.id,
      id: a.id,
      text: a.text,
      correct: a.correct,
      order: a.order,
    })),
  );

  if (answerRows.length > 0) {
    await tx.run(
      `
      UNWIND $rows AS row
      MATCH (l:Lesson {link: row.lessonLink})
      MERGE (q:Question {id: apoc.text.base64Encode(l.id +'--'+ row.questionSlug)})
      MERGE (a:Answer {id: row.id})
      SET a.text = row.text, a.correct = row.correct, a.order = toInteger(row.order)
      REMOVE a:DeletedAnswer
      MERGE (q)-[:HAS_ANSWER]->(a)
    `,
      { rows: answerRows },
    );
  }
};

export const markStaleQuestionsDeleted = (
  tx: ManagedTransaction,
  rows: { lessonLink: string; validQuestionIds: string[] }[],
) =>
  tx.run(
    `
    UNWIND $rows AS row
    MATCH (q:Question)
    WHERE q.lessonLink = row.lessonLink
      AND NOT q.id IN row.validQuestionIds
    SET q:DeletedQuestion
    WITH q
    MATCH (q)-[r:HAS_ANSWER]->(a:Answer)
    SET a:DeletedAnswer
    DELETE r
    `,
    { rows },
  );

// Integrity Checks
export const checkSchema = (session: Session) =>
  session.executeRead(async (tx) => {
    // Next Links?
    const next = await tx.run(`
      MATCH (a)-[:NEXT]->(b)
      WITH a, b, count(*) AS count

      WHERE count > 1

      RETURN *
  `);

    if (next.records.length > 1) {
      throw new Error(
        `Too many next links: \n ${JSON.stringify(
          next.records.map((row) => row.toObject()),
          null,
          2,
        )}`,
      );
    }
  });
