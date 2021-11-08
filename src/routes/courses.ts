import path from 'path'
import { existsSync } from 'fs'
import express, { Router, Request, Response, NextFunction } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { enrolInCourse } from '../domain/services/enrol-in-course'
import { getCourseWithProgress } from '../domain/services/get-course-with-progress'
import { verifyCodeChallenge } from '../domain/services/verify-code-challenge'
import { getToken, getUser } from '../middleware/auth'
import { createSandbox, getSandboxForUseCase, Sandbox } from '../modules/sandbox'
import { convertCourseOverview, convertCourseSummary, convertLessonOverview, convertModuleOverview, courseSummaryExists } from '../modules/asciidoc'
import NotFoundError from '../errors/not-found.error'
import { saveLessonProgress } from '../domain/services/save-lesson-progress'
import { Answer } from '../domain/model/answer'
import { ASCIIDOC_DIRECTORY, PUBLIC_DIRECTORY } from '../constants'
import { registerInterest } from '../domain/services/register-interest'
import { Course } from '../domain/model/course'
import { resetDatabase } from '../domain/services/reset-database'
import { bookmarkCourse } from '../domain/services/bookmark-course'
import { removeBookmark } from '../domain/services/remove-bookmark'
import { courseBannerPath, flattenAttributes, getSandboxConfig } from '../utils'
import { Pagination } from '../domain/model/pagination'
import { notify } from '../middleware/bugsnag'
import { saveLessonFeedback } from '../domain/services/feedback/save-lesson-feedback'
import { saveModuleFeedback } from '../domain/services/feedback/save-module-feedback'
import { unenrolFromCourse } from '../domain/services/unenrol-from-course'
import { classroomLocals } from '../middleware/classroom-locals'

const router = Router()

/**
 * Course Breadcrumbs
 */
router.use((req, res, next) => {
    res.locals.breadcrumbs = [
        {
            link: '/',
            text: 'Neo4j GraphAcademy',
        },
        {
            link: '/categories',
            text: 'All Courses',
        },
    ]

    next()
})

/**
 * @GET /
 *
 * Redirect the user to the category list
 */
router.get('/', requiresAuth(), async (req, res, next) => {
    try {
        res.redirect('/categories')
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course
 *
 * Render course information from course.adoc in the course root
 */
router.get('/:course', async (req, res, next) => {
    try {
        const user = await getUser(req)
        const token = await getToken(req)

        const course = await getCourseWithProgress(req.params.course, user, token)

        if (course.redirect) {
            return res.redirect(course.redirect)
        }

        const doc = await convertCourseOverview(course.slug)

        // Add Breadcrumb
        res.locals.breadcrumbs.push({
            link: course.link,
            text: course.title,
        })

        res.render('course/overview', {
            classes: `course ${course.slug}`,
            ...course,

            ogDescription: course.caption,
            ogTitle: `Take the ${course.title} course with Neo4j GraphAcademy`,
            ogImage: `${course.link}banner/`,

            course: { modules: course.modules },
            doc,
            summary: course.completed && courseSummaryExists(req.params.course),
            feedback: true,
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/interested
 *
 * When a course is in draft status, the user can register their interest using
 * the provided form.  By providing their email address they consent to .
 *
 * This route also creates a 'bookmark' for them
 */
router.post('/:course/interested', async (req, res, next) => {
    try {
        if (req.body.email) {
            const user = await getUser(req)
            await registerInterest(req.params.course, req.body.email, user)

            req.flash('success', 'Your interest in this course has been registered')

            return res.redirect(`/courses/${req.params.course}/`)
        }

        return res.redirect(`/courses/${req.params.course}/`)
    }
    catch (e) {
        next(e)
    }
})

/**
 * GET /:course/banner
 *
 * Create an image suitable for an og:image tag
 */
router.get('/:course/banner', async (req, res, next) => {
    try {
        // TODO: Caching, save to S3
        let filePath = courseBannerPath({ slug: req.params.course } as Course)

        if (!existsSync(filePath)) {
            filePath = path.join(PUBLIC_DIRECTORY, 'img', 'og', `og-layout.png`)
        }

        res.header('Content-Type', 'image/png')

        res.sendFile(filePath)
    }
    catch (e) {
        next(e)
    }
})

/**
 * GET /:course/bookmark
 *
 * Create a relationship between the user and course so it can be highlighted
 * in `My Courses`
 */
router.get('/:course/bookmark', requiresAuth(), async (req, res, next) => {
    try {
        const { course } = req.params
        const user = await getUser(req)

        await bookmarkCourse(course, user!)

        req.flash('success', 'This course has been bookmarked!')

        return res.redirect(`/courses/${req.params.course}/`)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/bookmark/remove
 *
 * Delete a bookmark
 */
router.get('/:course/bookmark/remove', requiresAuth(), async (req, res, next) => {
    try {
        const { course } = req.params
        const user = await getUser(req)

        await removeBookmark(course, user!)

        req.flash('success', 'Your bookmark has been removed')

        return res.redirect(`/courses/${req.params.course}/`)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/badge
 *
 * Find and send the badge.svg file in the course root
 */
router.get('/:course/badge', (req, res, next) => {
    try {
        let filePath = path.join(ASCIIDOC_DIRECTORY, 'courses', req.params.course, 'badge.svg')

        if (!existsSync(filePath)) {
            filePath = path.join(ASCIIDOC_DIRECTORY, '..', 'resources', 'svg', 'badgeDefault.svg')
        }

        res.header('Content-Type', 'image/svg+xml')

        res.sendFile(filePath)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/enrol
 *
 * Create an :Enrolment node between the user and the course within the database
 */
router.get('/:course/enrol', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const token = await getToken(req)

        const enrolment = await enrolInCourse(req.params.course, user!, token)

        if (enrolment.course.usecase) {
            try {
                await createSandbox(token, enrolment.course.usecase)
            }
            catch (e: any) {
                notify(e, (event) => {
                    event.setUser(user?.sub, user?.email, user?.name)

                    event.addMetadata('request', e.request)
                    event.addMetadata('response', e.response)
                })
            }
        }

        const goTo = enrolment.course.next?.link || `/courses/${enrolment.course.slug}/`

        res.redirect(goTo)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/unenrol
 *
 * Delete the user's enrolment and all answers/attempts
 */
router.get('/:course/unenrol', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const token = await getToken(req)

        await unenrolFromCourse(req.params.course, user!, token)

        req.flash('success', 'You have been successfully unenrolled from this course')

        const goTo = `/courses/${req.params.course}/`

        res.redirect(goTo)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/continue
 *
 * Redirect the user to the next lesson
 */
router.get('/:course/continue', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const course = await getCourseWithProgress(req.params.course, user)

        res.redirect(course.next?.link || course.link)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/summary
 *
 * If it exists, show the contents of summary.adoc
 */
router.get('/:course/summary', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)

        const course = await getCourseWithProgress(req.params.course, user)

        if (course.redirect) {
            return res.redirect(course.redirect)
        }
        // else if (!course.completed) {
        //     return res.redirect(course.link)
        // }

        const doc = await convertCourseSummary(course.slug)

        res.render('course/summary', {
            classes: `course-summary ${course.slug}`,
            title: 'Course Summary',
            course,
            doc,

        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/certificate
 *
 * Redirect the user to their public certificate
 */
router.get('/:course/certificate', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const course = await getCourseWithProgress(req.params.course, user)

        if (!course.completed) {
            return res.redirect(course.link!)
        }

        return res.redirect(`/u/${user!.id}/${course.slug}/`)
    }
    catch (e) {
        next(e)
    }
})

const browser = async (req: Request, res: Response, next: NextFunction) => {
    const token = await getToken(req)
    const user = await getUser(req)

    try {
        // Check that user is enrolled
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled === false) {
            return res.redirect(`/courses/${req.params.course}/`)
        }

        // Check that a use case exists
        // TODO: Specific 404
        if (!course.usecase) {
            return next(new NotFoundError(`No use case for ${req.params.course}`))
        }

        // Check that the user has created a sandbox
        let sandbox = await getSandboxForUseCase(token, course.usecase as string)

        // If sandbox doesn't exist then recreate it
        if (!sandbox) {
            sandbox = await createSandbox(token, course.usecase!)
        }

        // Pre-fill credentials and redirect to browser
        res.render('browser', {
            classes: `course ${req.params.course}`,
            layout: 'empty',
            scheme: sandbox!.scheme,
            host: sandbox!.host,
            port: sandbox!.boltPort,
            username: 'neo4j',
            password: sandbox!.password
        })
    }
    catch (e: any) {
        notify(e, (event) => {
            event.setUser(user?.sub, user?.email, user?.name)

            event.addMetadata('request', e.request)
            event.addMetadata('response', e.response)
        })

        // 400/401 on sandbox API - redirect to login
        return res.redirect(`/login?returnTo=${req.originalUrl}`)
    }
}
/**
 * @GET /:course/browser
 *
 * Pre-fill the login credentials into local storage and then redirect to the
 * patched version of browser hosted at /browser/
 */

router.get('/:course/browser', requiresAuth(), browser)

/**
 * @GET /:course/:module/browser
 *
 * Pre-fill the login credentials into local storage and then redirect to the
 * patched version of browser hosted at /browser/
 */
router.get('/:course/:module/browser', requiresAuth(), browser)


/**
 * @GET /:course/:module
 *
 * If none of the routes matched above, this URL must be a module page.
 * Render courseindex.adoc in the course root
 */
router.get('/:course/:module', classroomLocals, async (req, res, next) => {
    try {
        const user = await getUser(req)
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled === false) {
            return res.redirect(`/courses/${req.params.course}/`)
        }

        const module = course.modules.find(row => row.slug === req.params.module)

        if (!module) {
            return next(new NotFoundError(`Could not find module ${req.params.module} of ${req.params.course}`))
        }

        const doc = await convertModuleOverview(req.params.course, req.params.module)

        // Configure Sandbox
        const {
            showSandbox,
            sandboxVisible,
            sandboxUrl,
        } = await getSandboxConfig(course)

        res.render('course/module', {
            classes: `module ${req.params.course}-${req.params.module}  ${module!.completed || course!.completed ? 'lesson--completed' : ''}`,
            feedback: true,
            ...module,
            type: 'module overview',
            path: req.originalUrl,
            enrolled: course.enrolled,
            course,
            doc,
            showSandbox,
            sandboxVisible,
            sandboxUrl,
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * Store feedback for a module
 */
router.post('/:course/:module/feedback', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const { course, module } = req.params

        const json = await saveModuleFeedback(user!, course, module, req.body)

        if (json.status === 'ok') {
            res.status(201)
        }
        else {
            res.status(404)
        }

        res.json(json)

    }
    catch (e) {
        next(e)
    }
})

/**
 * Static routing for module images
 */
router.use('/:course/:module/images', (req, res, next) => {
    const { course, module } = req.params

    express.static(path.join(ASCIIDOC_DIRECTORY, 'courses', course, 'modules', module, 'images'))(req, res, next)
})

async function getPageAttributes(req: Request, course: Course): Promise<Record<string, any>> {
    const user = await getUser(req)

    const attributes: Record<string, any> = {
        name: user!.nickname,
    }

    if (course.usecase) {
        const token = await getToken(req)

        const sandboxConfig = await getSandboxForUseCase(token, course.usecase)

        attributes['sandbox-uri'] = `${sandboxConfig?.scheme}://${sandboxConfig?.host}:${sandboxConfig?.boltPort}`
        attributes['sandbox-username'] = sandboxConfig?.username;
        attributes['sandbox-password'] = sandboxConfig?.password;
    }

    // Course repository
    attributes['repository'] = course.repository

    return attributes
}

/**
 * @GET /:course/:module/:lesson
 *
 * Render a lesson, plus any quiz or challenges and the sandbox if necessary
 */
router.get('/:course/:module/:lesson', requiresAuth(), classroomLocals, async (req, res, nextfn) => {
    try {
        const user = await getUser(req)
        const token = await getToken(req)
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled === false) {
            return res.redirect(`/courses/${req.params.course}/`)
        }

        const module = course.modules.find(row => row.slug === req.params.module)

        if (!module) {
            return nextfn(new NotFoundError(`Could not find module ${req.params.module} of ${req.params.course}`))
        }

        else if (!module!.lessons) {
            return nextfn(new NotFoundError(`Could not find lessons for module ${req.params.module} of ${req.params.course}`))
        }

        const lesson = module!.lessons.find(row => row.slug === req.params.lesson)

        if (!lesson) {
            return nextfn(new NotFoundError(`Could not find lesson ${req.params.lesson} in module ${req.params.module} of ${req.params.course}`))
        }

        // Add sandbox attributes to Page Attributes?
        let sandbox: Sandbox = {} as Sandbox

        if (course.usecase) {
            try {
                let sandboxInfo = await getSandboxForUseCase(token, course.usecase)

                if (sandboxInfo !== undefined) {
                    sandbox = sandboxInfo
                }
            }
            catch (e) {
                // Probably fine...
            }
        }

        // Build Attributes for adoc
        const attributes = {
            ...await getPageAttributes(req, course),
            ...flattenAttributes({sandbox}),
        }

        const doc = await convertLessonOverview(req.params.course, req.params.module, req.params.lesson, attributes)

        // Configure Sandbox
        const {
            showSandbox,
            sandboxVisible,
            sandboxUrl,
        } = await getSandboxConfig(course, lesson)

        // Reset Database?
        if (course.usecase && !lesson?.completed) {
            await resetDatabase(token, req.params.course, req.params.module, req.params.lesson, course.usecase)
        }

        // Next link in pagination?
        let next: Pagination | undefined = lesson!.next

        if (!next && course.completed) {
            next = {
                title: 'Course Summary',
                link: `${course.link}summary/`
            }
        }

        res.render('course/lesson', {
            classes: `lesson ${req.params.course}-${req.params.module}-${req.params.lesson} ${lesson!.completed || course!.completed ? 'lesson--completed' : ''}`,
            feedback: true,
            ...lesson,
            path: req.originalUrl,
            course,
            enrolled: course.enrolled,
            module,
            doc,
            next,
            showSandbox,
            sandboxUrl,
            sandboxVisible,
            summary: await courseSummaryExists(req.params.course),
        })
    }
    catch (e) {
        nextfn(e)
    }
})

/**
 * @POST /:course/:module/:lesson
 *
 * Save the answers that the user has given and mark the module as complete if necessary
 *
 * TODO: Improve internal checking that quiz has been passed
 */
router.post('/:course/:module/:lesson', requiresAuth(), async (req, res, next) => {
    try {
        const { course, module, lesson } = req.params
        const answers: Answer[] = req.body

        const user = await getUser(req)
        const output = await saveLessonProgress(user!, course, module, lesson, answers)

        res.json(output)
    }
    catch (e) {
        next(e)
    }
})

/**
 * Store feedback for a lesson
 */
router.post('/:course/:module/:lesson/feedback', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const { course, module, lesson } = req.params

        const json = await saveLessonFeedback(user!, course, module, lesson, req.body)

        if (json.status === 'ok') {
            res.status(201)
        }
        else {
            res.status(404)
        }

        res.json(json)

    }
    catch (e) {
        next(e)
    }
})

/**
 * Static routing for module images
 */
router.use('/:course/:module/:lesson/images', (req, res, next) => {
    const { course, module, lesson } = req.params

    express.static(path.join(ASCIIDOC_DIRECTORY, 'courses', course, 'modules', module, 'lessons', lesson, 'images'))(req, res, next)
})

/**
 * @GET /:course/:module/:lesson/verify
 *
 * Verify that the challenge has been completed in the database.
 * This method takes the verify.cypher file from the lesson folder and
 * runs it against the database.  The query should return a single row with an
 * outcome column - which should return true or false
 */
router.post('/:course/:module/:lesson/verify', requiresAuth(), async (req, res, next) => {
    try {
        const { course, module, lesson } = req.params
        const user = await getUser(req)
        const token = await getToken(req)

        const outcome = await verifyCodeChallenge(user!, token, course, module, lesson)

        res.json(outcome)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/:module/:lesson/read
 *
 * Mark a text-only page as completed
 *
 * input::read[type=button,class=btn,value=Mark as Read]
 *
 */
router.post('/:course/:module/:lesson/read', requiresAuth(), async (req, res, next) => {
    try {
        const { course, module, lesson } = req.params
        const user = await getUser(req)

        const outcome = await saveLessonProgress(user!, course, module, lesson, [])

        res.json(outcome)
    }
    catch (e) {
        next(e)
    }
})

export default router