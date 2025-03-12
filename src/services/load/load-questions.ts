import { join, parse } from "path";
import { LessonToImport } from "./load-lessons";
import { convert, doc, loadFile } from "../../modules/asciidoc";
import { COURSE_DIRECTORY } from "../../constants";
import { existsSync } from "fs";
import { readdir } from "fs/promises";

export type QuestionToImport = {
  id: string;
  filename: string;
  text: string;
}

const generateQuestionId = (title: string): string => {
  const adoc = `== ${title}`
  const html = doc.load(adoc).convert()
  const matches = html.match(/<h2 id="([^"]+)">/);

  if (matches) {
    return matches[1];
  }

  return '_' + title.replace(/(<([^>]+)>)/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+$/g, '')
}

const loadQuestion = (lesson: LessonToImport, filename: string): QuestionToImport => {
  const parsed = parse(filename)
  const file = loadFile(
    join(
      COURSE_DIRECTORY,
      lesson.course.slug,
      'modules',
      lesson.module.slug,
      'lessons',
      lesson.slug,
      'questions',
      filename
    ), { parse_header_only: true }
  )
  const id = file.getAttribute('id', generateQuestionId(file.getDocumentTitle({ sanitize: true }) as string))

  return {
    id,
    filename: parsed.base,
    text: file.getTitle(),
    lessonLink: lesson.link,
  } as QuestionToImport
}

export default async function loadQuestions(lessons: LessonToImport[]): Promise<QuestionToImport[]> {
  const output: QuestionToImport[] = []
  for (const lesson of lessons) {
    const questionDir = join(
      COURSE_DIRECTORY, lesson.course.slug,
      'modules', lesson.module.slug,
      'lessons', lesson.slug,
      'questions'
    )

    if (existsSync(questionDir)) {
      const questions = await readdir(questionDir)
        .then(filenames => filenames.filter(
          filename => filename.endsWith('.adoc')
        ))

      for (const filename of questions) {
        const question = await loadQuestion(lesson, filename)
        output.push(question)
      }
    }
  }

  return output
}
