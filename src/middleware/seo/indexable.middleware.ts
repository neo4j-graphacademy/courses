import { NextFunction, Request, Response } from "express";
import { getCourseWithProgress } from "../../domain/services/get-course-with-progress";
import NotFoundError from "../../errors/not-found.error";
import { convertLessonOverview, convertModuleOverview } from "../../modules/asciidoc";
import verify from 'googlebot-verify'
import { GRAPHACADEMY_CHATBOT_USERAGENT, IS_PRODUCTION } from "../../constants";

export default async function indexable(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent']

    // Is the user allowed to index this page?
    let allowIndex = false

    // Local googlebot testing
    if (!IS_PRODUCTION && req.query.googlebot === 'true') {
        allowIndex = true
    }

    // Check for GeaphAcademy Chatbot user agent
    else if (userAgent?.startsWith(GRAPHACADEMY_CHATBOT_USERAGENT)) {
        allowIndex = true
    }

    // Is this a google bot?
    else {
        const ip = req.headers['x-forwarded-for']
        try {
            allowIndex = await verify(ip)
        }
        catch {
            // Do nothing
        }
    }

    // If indexing isn't allowed, advance to next middleware
    if (!allowIndex) {
        return next()
    }

    // Get Course Information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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