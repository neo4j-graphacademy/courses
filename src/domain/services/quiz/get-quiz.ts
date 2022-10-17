import fs from 'fs'
import path from 'path'
import { ASCIIDOC_DIRECTORY } from '../../../constants';
import { getLessonDirectory, loadFile } from "../../../modules/asciidoc";
import { CourseWithProgress } from '../../model/course';
import { Lesson, LESSON_TYPE_QUIZ } from '../../model/lesson';
import { Module } from '../../model/module';


interface QuizQuestion {
    module: Module;
    lesson: Lesson;
    roles: string;
    title?: string;
    html: string;
}


export function getQuiz(course: CourseWithProgress): Promise<QuizQuestion[]> {
    const questions = course.modules.reduce(
        (lessons: [Lesson, Module][], module: Module) => lessons.concat(
            module.lessons
                .filter(lesson => lesson.type === LESSON_TYPE_QUIZ)
                .map(lesson => [lesson, module])
        ), []
    )
        .map(([lesson, module]) => ({
            lesson,
            module,
            questionsFolder: path.join(ASCIIDOC_DIRECTORY, getLessonDirectory(course.slug, module.slug, lesson.slug), 'questions'),
        }))
        .reduce((acc: { lesson: Lesson, module: Module, questionPath: string }[], { lesson, module, questionsFolder }) => {
            const questions = fs.readdirSync(questionsFolder)
                .map(questionFilename => ({ lesson, module, questionPath: path.join(questionsFolder, questionFilename) }))

            return acc.concat(questions)
        }, [])

    const output: QuizQuestion[] = questions.map(({ lesson, module, questionPath }) => {
        const file = loadFile(questionPath.replace(ASCIIDOC_DIRECTORY, ''))
        const title = file.getTitle()
        const html = file.convert()

        return {
            lesson,
            module,
            title,
            html,
            roles: file.getRoles().join(' ')
        }
    })

    return Promise.resolve(output)
}
