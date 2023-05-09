import { NextFunction, Request, Response } from "express";
import { getCourseWithProgress } from "../../domain/services/get-course-with-progress";
import NotFoundError from "../../errors/not-found.error";
import { convertLessonOverview, convertModuleOverview } from "../../modules/asciidoc";
import verify from 'googlebot-verify'
import { IS_PRODUCTION } from "../../constants";

export default async function indexable(req: Request, res: Response, next: NextFunction) {
    if (!IS_PRODUCTION && req.query.googlebot !== 'true') {
        return next()
    }

    // Verify Google IP
    const ip = req.headers['x-forwarded-for']

    const isGoogle = await verify(ip)
    if (!isGoogle) {
        return next()
    }

    // Get Course Information
    const [_, __, courseSlug, moduleSlug, lessonSlug] = req.originalUrl.split('?')[0].split('/')

    const course = await getCourseWithProgress(courseSlug)

    if (!course) {
        return next(new NotFoundError())
    }

    // Check for Module
    if (moduleSlug !== undefined) {
        const module = course.modules.find(module => module.slug === moduleSlug)

        if (!module) {
            return next(new NotFoundError())
        }

        // Render Lesson?
        if (lessonSlug) {
            const lesson = module.lessons.find(lesson => lesson.slug === lessonSlug)

            if (!lesson) {
                return next(new NotFoundError())
            }

            const doc = await convertLessonOverview(courseSlug, moduleSlug, lessonSlug)

            return res.render('course/lesson', {
                title: lesson.title,
                next: lesson.next,
                previous: lesson.previous,
                course,
                module,
                lesson,
                doc,
            })
        }



        // Render Module
        const doc = await convertModuleOverview(courseSlug, moduleSlug)

        return res.render('course/module', {
            ...module,
            title: module.title,
            course,
            module, doc
        })

    }



    // No indexable content to display
    next()
}