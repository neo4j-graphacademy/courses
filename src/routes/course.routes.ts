import path from 'path'
import { existsSync, readFileSync } from 'fs'
import express, { Router, Request, Response, NextFunction } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { enrolInCourse } from '../domain/services/enrol-in-course'
import { getCourseWithProgress } from '../domain/services/get-course-with-progress'
import { verifyCodeChallenge } from '../domain/services/verify-code-challenge'
import { getToken, getUser } from '../middleware/auth.middleware'
import { createSandbox, getSandboxByHashKey, getSandboxForUseCase, SANDBOX_STATUS_NOT_FOUND } from '../modules/sandbox'
import { convertCourseOverview, convertCourseSummary, convertLessonOverview, convertModuleOverview, courseSlidesExist, courseSlidesPdfPath, courseSummaryExists } from '../modules/asciidoc'
import NotFoundError from '../errors/not-found.error'
import { saveLessonProgress } from '../domain/services/save-lesson-progress'
import { Answer } from '../domain/model/answer'
import { ASCIIDOC_DIRECTORY, BASE_URL, CDN_URL, PUBLIC_DIRECTORY } from '../constants'
import { registerInterest } from '../domain/services/register-interest'
import { Course, CourseWithProgress, LANGUAGE_CN, LANGUAGE_JP } from '../domain/model/course'
import { resetDatabase } from '../domain/services/reset-database'
import { bookmarkCourse } from '../domain/services/bookmark-course'
import { removeBookmark } from '../domain/services/remove-bookmark'
import { canonical, courseBannerPath, getPageAttributes, getSandboxConfig, repositoryBlobUrl, repositoryLink, repositoryRawUrl } from '../utils'
import { Pagination } from '../domain/model/pagination'
import { notify, notifyPossibleRequestError } from '../middleware/bugsnag.middleware'
import { saveLessonFeedback } from '../domain/services/feedback/save-lesson-feedback'
import { saveModuleFeedback } from '../domain/services/feedback/save-module-feedback'
import { unenrolFromCourse } from '../domain/services/unenrol-from-course'
import { classroomLocals } from '../middleware/classroom-locals.middleware'
import { createAndSaveSandbox } from '../domain/services/create-and-save-sandbox'
import { emitter } from '../events'
import { UserViewedCourse } from '../domain/events/UserViewedCourse'
import { UserViewedModule } from '../domain/events/UserViewedModule'
import { UserViewedLesson } from '../domain/events/UserViewedLesson'
import { getCategory, getRef, getTeam } from '../middleware/save-ref.middleware'
import { forceTrailingSlash } from '../middleware/trailing-slash.middleware'
import { requiredCompletedProfile } from '../middleware/profile.middleware'
import { translate } from '../modules/localisation'
import { User } from '../domain/model/user'
import { courseOgBannerImage } from './route.utils'
import { getQuiz } from '../domain/services/quiz/get-quiz'
import { saveQuizResults } from '../domain/services/quiz/save-quiz-results'
import { saveQuizFeedback } from '../domain/services/feedback/save-quiz-feedback'
import { getSuggestionsForEnrolment } from '../domain/services/get-suggestions-for-enrolment'
import { getSuggestionsForCourse } from '../domain/services/get-suggestions-for-course'
import indexable from '../middleware/seo/indexable.middleware'
import { Sandbox } from '../domain/model/sandbox'
import { UserResetDatabase } from '../domain/events/UserResetDatabase'
import getChatbot from '../modules/chatbot/chatbot.class'
import { generateBearerToken } from '../modules/openai-proxy/openai-proxy.utils'
import { UserSharedCertificate } from '../domain/events/UserSharedCertificate'

const router = Router()

/**
 * Redirects
*/
const redirects = {
    '/courses/gds-certification/': '/certifications/gds-certification/',
    '/courses/neo4j-certification/': '/certifications/neo4j-certification/',
    '/courses/llm-chatbot/': '/courses/llm-chatbot-python/',
    '/courses/app-go-old/': '/courses/app-go/',
    '/courses/neo4j/': '/courses/neo4j-fundamentals/',
}

router.use((req, res, next) => {
    if (redirects[req.originalUrl]) {
        return res.redirect(301, redirects[req.originalUrl])
    }

    next()
})


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
router.get('/', (req, res, next) => {
    try {
        res.redirect(301, '/categories/')
    }
    catch (e) {
        next(e)
    }
})

/**
 * Redirect old language courses to their en-US equivalent
 */
router.get(`/:language(${LANGUAGE_JP}|${LANGUAGE_CN})-:slug`, (req, res) => {
    res.redirect(301, `/courses/${req.params.slug}/`)
})

/**
 * @GET /:course
 *
 * Render course information from course.adoc in the course root
 */
router.get('/:course', forceTrailingSlash, async (req, res, next) => {
    // NotFoundError: Course neo4j-â¦ could not be found -   "user-agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
    if (decodeURIComponent(req.params.course).length === 9 && req.params.course.startsWith('neo4j-')) {
        return res.redirect('/courses/neo4j-fundamentals/')
    }
    else if (req.params.course === 'neo4j-certification') {
        return res.redirect('/certifications/neo4j-certification/')
    }

    try {
        const user = await getUser(req)
        const token = await getToken(req)

        const course = await getCourseWithProgress(req.params.course, user, token)

        if (course.redirect) {
            return res.redirect(course.redirect)
        }

        // Emit user viewed course
        if (user) {
            emitter.emit(new UserViewedCourse(user, course))
        }

        const doc = await convertCourseOverview(course.slug)

        // Recommendations
        const recommendations = await getSuggestionsForCourse(user?.id, course.slug, 3)

        // Add Breadcrumb
        res.locals.breadcrumbs.push({
            link: course.link,
            text: course.title,
        })

        res.render('course/overview', {
            classes: `course ${course.certification ? 'certification' : ''} ${course.slug} ${course.completed ? 'course--completed' : ''}  ${course.enrolled ? 'course--enrolled' : ''}`,

            // For analytics.pug
            analytics: {
                course: {
                    slug: course.slug,
                    title: course.title,
                    link: course.link,
                },
                user: {
                    id: user?.id
                }
            },

            course,
            title: `${course.title} | ${course.categories[0]?.title} `,
            canonical: canonical(course.link),
            // ...course,

            translate: translate(course.language),

            ogDescription: course.caption,
            ogTitle: `Take the ${course.title} course with Neo4j GraphAcademy`,
            ogImage: courseOgBannerImage(course.slug),
            recommendations,

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
            await registerInterest(req.params.course, req.body.email as string, user)

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
router.get('/:course/banner', (req, res, next) => {
    try {
        let filePath = courseBannerPath({ slug: req.params.course } as Course)

        if (!existsSync(filePath)) {
            // Prefer CDN
            if (CDN_URL) {
                return res.redirect(`${CDN_URL}/img/og/og-landing.png`)
            }

            filePath = path.join(PUBLIC_DIRECTORY, 'img', 'og', `og-landing.png`)
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

        await bookmarkCourse(course, user as User)

        req.flash('success', 'This course has been saved for later!')

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

        await removeBookmark(course, user as User)

        req.flash('success', 'Your bookmark has been removed')

        const redirectTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : `/courses/${req.params.course}/`

        return res.redirect(redirectTo)
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
            filePath = path.join(__dirname, '..', '..', 'resources', 'svg', 'badgeDefault.svg')
        }

        res.header('Content-Type', 'image/svg+xml')

        res.sendFile(filePath)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/illustration
 *
 * Find and send the illustration.svg file in the course root
 */
router.get('/:course/illustration', (req, res) => {
    try {
        let filePath = path.join(ASCIIDOC_DIRECTORY, 'courses', req.params.course, 'illustration.svg')

        if (!existsSync(filePath)) {
            filePath = path.join(__dirname, '..', '..', 'resources', 'svg', 'illustrationDefault.svg')
        }

        res.header('Content-Type', 'image/svg+xml')

        res.sendFile(filePath)
    }
    catch (e) {
        return '<svg></svg>'
        // next(e)
    }
})

/**
 * @GET /:course/enrol
 *
 * Create an :Enrolment node between the user and the course within the database
 */
router.get('/:course/enrol', requiresAuth(), /*requiresVerification,*/ requiredCompletedProfile, async (req, res, next) => {
    try {
        const user = await getUser(req) as User
        const token = await getToken(req)
        const ref = getRef(req)
        const team = getTeam(req)
        const category = getCategory(req)

        const enrolment = await enrolInCourse(req.params.course, user, token, ref, team, category)

        let goTo = enrolment.course.next?.link || `/courses/${enrolment.course.slug}/`

        if (enrolment.course.classmarkerReference) {
            goTo = `https://www.classmarker.com/online-test/start/?quiz=${enrolment.course.classmarkerReference}&cm_fn=${user.givenName}&cm_user_id=${user.sub}&cm_e=${user.email}`
        }

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
        const user = await getUser(req) as User
        const token = await getToken(req)

        await unenrolFromCourse(req.params.course, user, token)

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
router.get('/:course/summary', indexable, requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)

        const course = await getCourseWithProgress(req.params.course, user)

        if (course.redirect) {
            return res.redirect(course.redirect)
        }

        const doc = await convertCourseSummary(course.slug)
        const recommendations = await getSuggestionsForEnrolment(course.enrolmentId)

        res.render('course/summary', {
            classes: `course-summary ${course.slug} show-confetti`,
            hideToc: true,
            hideSuccess: true,
            hidePagination: true,
            title: 'Course Summary',
            course,
            recommendations,
            doc,
            slides: await courseSlidesExist(course.slug),
            translate: translate(course.language),
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/slides
 *
 * If it exists, download slides.pdf
 */
router.get('/:course/slides.pdf', indexable, requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)

        const course = await getCourseWithProgress(req.params.course, user)

        if (!course.completed) {
            return res.redirect(course.link)
        }

        const slides = await courseSlidesPdfPath(course.slug)

        if (!slides) {
            return res.redirect(course.link)
        }

        const cdnLink = `${CDN_URL}/slides/${course.slug}.pdf`

        return res.redirect(cdnLink)

        // res.sendFile(cdnLink)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/share/linkedin
 *
 * Add the users certificate to their linkedin profile
 */
router.get('/:course/share/linkedin', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)

        const course = await getCourseWithProgress(req.params.course, user)

        if (user === undefined || typeof course.redirect === 'string') {
            return res.redirect(course.redirect || '/courses/')
        }

        emitter.emit(new UserSharedCertificate(user, course))

        // Year and month for LinkedIn
        const year = course.completedAt ? course.completedAt.getFullYear() : null
        const month = course.completedAt ? course.completedAt.getMonth() + 1 : null

        return res.redirect(`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(course.title)}&organizationId=828370&organizationName=Neo4j&issueYear=${year}&issueMonth=${month}&certId=${course.certificateId}&certUrl=${encodeURIComponent(course.certificateUrl || '')}`)
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
            return res.redirect(course.link)
        }

        return res.redirect(`/u/${(user as User).id}/${course.slug}/`)
    }
    catch (e) {
        next(e)
    }
})

const checkSandboxExists = async (user: User, token: string, enrolment: CourseWithProgress): Promise<Sandbox | undefined> => {
    // No Usecase?  No Problem
    if (!enrolment.usecase) {
        return Promise.resolve(undefined)
    }

    // No hash key? Create sandbox
    if (!enrolment.sandbox) {
        return createAndSaveSandbox(token, user, enrolment)
    }

    try {
        const { sandbox, status } = await getSandboxByHashKey(token, user, enrolment.sandbox.sandboxHashKey)

        // If sandbox isn't found (ie, terminated after 3 days), create a new one and create the enrolment node
        if (status === SANDBOX_STATUS_NOT_FOUND) {
            const recreated = await createAndSaveSandbox(token, user, enrolment)

            return recreated
        }

        return sandbox
    }
    catch (e) {
        return createSandbox(token, user, enrolment.usecase)
    }
}

router.get('/:course/sandbox.json', requiresAuth(), /*requiresVerification,*/ async (req, res) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req) as User
        const { course } = req.params

        // Check Enrolment
        const enrolment = await getCourseWithProgress(course, user, token)

        if (!enrolment) {
            return res.status(404)
        }
        else if (!enrolment.usecase) {
            return res.status(404)
        }

        // Check Sandbox Exists
        const sandbox = await checkSandboxExists(user, token, enrolment)

        if (!sandbox) {
            throw new NotFoundError(`No sandbox for course ${course}, usecase: ${enrolment.usecase}`)
        }

        res.json(sandbox)
    }
    catch (e: any) {
        res.json({
            message: e.message,
        })
        // next(e)
    }
})

const browser = async (req: Request, res: Response, next: NextFunction) => {
    const token = await getToken(req)
    const user = await getUser(req) as User

    try {
        // Check that user is enrolled
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled === false) {
            return res.redirect(`/courses/${req.params.course}/`)
        }

        // Check that a use case exists
        if (!course.usecase) {
            return next(new NotFoundError(`No use case for ${req.params.course}`))
        }

        // Check that the user has created a sandbox
        await checkSandboxExists(user, token, course)

        const ga = JSON.stringify({
            user: {
                sub: user?.sub,
            },
            course: {
                slug: course.slug,
                title: course.title,
                usecase: course.usecase,
            },
            referrer: req.originalUrl,
        })

        const browserDist = path.join(__dirname, '..', '..', 'browser', 'dist')

        const html = readFileSync(path.join(browserDist, 'index.html')).toString()
            .replace('</body>', `\n<script nonce="${res.locals.nonce}">\nwindow.ga = ${ga}\n</script>\n</body>`)
            .replace('</head>', `\n<base href="/browser/"></head>`)


        res.send(html)
    }
    catch (e: any) {
        if (!e.isSandboxError) {
            notifyPossibleRequestError(e, user)
        }

        // 400/401 on sandbox API - redirect to login
        return res.redirect(`/login?returnTo=${req.originalUrl}`)
    }
}


/**
 * @GET /:course/browser
 * @GET /:course/browser/:module
 * @GET /:course/browser/:module/:lesson
 *
 * Display the patched browser
 */
router.get('/:course/browser', requiresAuth(), /*requiresVerification,*/ browser)
router.get('/:course/:module/browser', requiresAuth(), /*requiresVerification,*/ browser)
router.get('/:course/:module/:lesson/browser', requiresAuth(), /*requiresVerification,*/ browser)

const chat = async (req: Request, res: Response) => {
    try {
        const user = await getUser(req) as User
        const chat = getChatbot()

        const { message } = req.body

        if (chat && typeof message === 'string' && message !== '') {
            const response = await chat.askQuestion(user, message, req.originalUrl.replace(/chat$/, ''))

            return res.json(response)
        }

        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong.'
        })
    }
    catch (e: any) {
        notify(e)

        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong.'
        })
    }
}

router.post('/:course/:module/chat', requiresAuth(), /*requiresVerification,*/ chat)
router.post('/:course/:module/:lesson/chat', requiresAuth(), /*requiresVerification,*/ chat)


/**
 * @GET /:course/quiz
 *
 * Take a quick quiz to pass the course
 *
 */
router.get('/:course/quiz', forceTrailingSlash, requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled !== true) {
            req.flash('info', 'You must be enrolled to take the quiz')

            return res.redirect(`/courses/${req.params.course}/`)
        }
        // If already completed, don't show again
        else if (course.completed) {
            req.flash('info', 'You have already completed this course!')

            return res.redirect(`/courses/${req.params.course}/`)
        }
        // Quiz available after 7 days
        else if (!course.quizAvailable && !user.isNeo4jEmployee) {
            req.flash('info', 'Quizzes is only available after 7 days')

            return res.redirect(`/courses/${req.params.course}/`)
        }

        const quiz = await getQuiz(course)

        return res.render('course/quiz', {
            classes: `quiz ${req.params.course}-quiz  ${course.completed ? 'course--completed' : ''}`,
            title: `${translate(course.language)('quiz-title', 'Pop Quiz')} | ${course.title}`,
            analytics: {
                course: {
                    slug: course.slug,
                    title: course.title,
                    summary: course.summary,
                    link: course.link,
                },
                user: {
                    id: user.id,
                }
            },
            feedback: true,
            ...module,
            type: 'quiz',
            path: req.originalUrl,
            enrolled: course.enrolled,
            course,
            quiz,
            translate: translate(course.language),
        })
    }
    catch (e) {
        next(e)
    }
})


/**
 * @POST /:course/quiz
 *
 * Save quick quiz results
 *
 */
router.post('/:course/quiz', forceTrailingSlash, requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User
        const token = await getToken(req)
        const course = await getCourseWithProgress(req.params.course, user)
        const quiz = await getQuiz(course)

        // If not enrolled, send to course home
        if (course.enrolled !== true) {
            return res.status(400).json({
                message: 'You must be enrolled to take the quiz'
            })
        }
        // If already completed, don't show again
        else if (course.completed) {
            return res.status(400).json({
                message: 'You have already completed this course!'
            })
        }

        const answers = req.body.answers

        // TODO: More robust check
        if (!answers.length || quiz.length !== answers.length || !answers.every(el => el.correct === true)) {
            return res.status(400).json({
                message: 'Incorrect answers.  Please try again.'
            })
        }

        // Save results
        const output = await saveQuizResults(user, token, course.slug, answers)

        return res.json(output)
    }
    catch (e) {
        next(e)
    }
})


/**
 * @POST /:course/quiz/feedback
 *
 * Save feedback for the quiz
 *
 */
router.post('/:course/quiz/feedback', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const { course } = req.params

        const output = await saveQuizFeedback(user as User, course, req.body)

        if (output.status === 'ok') {
            res.status(201)
        }
        else {
            res.status(404)
        }

        res.json(output)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /:course/:module/browser
 *
 * Pre-fill the login credentials into local storage and then redirect to the
 * patched version of browser hosted at /browser/
 */
router.get('/:course/:module/browser', requiresAuth(), /*requiresVerification,*/ browser)


/**
 * @GET /:course/:module
 *
 * If none of the routes matched above, this URL must be a module page.
 * Render courseindex.adoc in the course root
 */
router.get('/:course/:module', indexable, requiresAuth(), classroomLocals, forceTrailingSlash, async (req, res, next) => {
    try {
        const user = await getUser(req)
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled !== true) {
            req.flash('info', 'You must be enrolled to view this content')

            return res.redirect(`/courses/${req.params.course}/`)
        }

        const module = course.modules.find(row => row.slug === req.params.module)

        if (!module) {
            return next(new NotFoundError(`Could not find module ${req.params.module} of ${req.params.course}`))
        }

        const attributes = {
            ...await getPageAttributes(req, course, module),
        }

        const doc = await convertModuleOverview(req.params.course, req.params.module, attributes)

        // Configure Sandbox
        const {
            showSandbox,
            sandboxVisible,
            sandboxUrl,
        } = await getSandboxConfig(course)

        // Emit user viewed module
        emitter.emit(new UserViewedModule(user as User, course, module))

        res.render('course/module', {
            classes: `module ${req.params.course}-${req.params.module}  ${course.completed ? 'course--completed' : ''} ${module.completed ? 'module--completed' : ''}`,
            analytics: {
                course: {
                    slug: course.slug,
                    title: course.title,
                    summary: course.summary,
                    link: course.link,
                },
                module: {
                    slug: module.slug,
                    title: module.title,
                },
                user: {
                    id: (user as User).id,
                }
            },
            user,
            feedback: false,
            ...module,
            type: 'module',
            path: req.originalUrl,
            enrolled: course.enrolled,
            course,
            doc,
            showSandbox,
            sandboxVisible,
            sandboxUrl,
            translate: translate(course.language),
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

        const json = await saveModuleFeedback(user as User, course, module, req.body)

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

/**
 * @GET /:course/:module/:lesson
 *
 * Render a lesson, plus any quiz or challenges and the sandbox if necessary
 */
router.get('/:course/:module/:lesson', indexable, requiresAuth(), /*requiresVerification,*/ classroomLocals, forceTrailingSlash, async (req, res, nextfn) => {
    try {
        const user = await getUser(req)
        const token = await getToken(req)
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled !== true) {
            req.flash('info', 'You must be enrolled to view this content')

            return res.redirect(`/courses/${req.params.course}/`)
        }

        const module = course.modules.find(row => row.slug === req.params.module)

        if (!module) {
            return nextfn(new NotFoundError(`Could not find module ${req.params.module} of ${req.params.course}`))
        }

        else if (!module.lessons) {
            return nextfn(new NotFoundError(`Could not find lessons for module ${req.params.module} of ${req.params.course}`))
        }

        const lesson = module.lessons.find(row => row.slug === req.params.lesson)

        if (!lesson) {
            return nextfn(new NotFoundError(`Could not find lesson ${req.params.lesson} in module ${req.params.module} of ${req.params.course}`))
        }

        // Find or create the sandbox
        if (course.usecase && user && course.completed === false) {
            try {
                await createAndSaveSandbox(token, user, course)

            }
            catch (e: any) {
                // Silent error, already reported in sandbox module
                if (!e.isSandboxError) {
                    notifyPossibleRequestError(e, user)
                }
            }
        }

        // Build Attributes for adoc
        const attributes = {
            ...await getPageAttributes(req, course, module, lesson),
        }

        const doc = await convertLessonOverview(req.params.course, req.params.module, req.params.lesson, attributes)

        // Configure Sandbox
        const {
            showSandbox,
            sandboxVisible,
            sandboxUrl,
        } = await getSandboxConfig(course, lesson)

        // Reset Database?
        if (user && course.usecase && !lesson?.completed) {
            void resetDatabase(token, user, req.params.course, req.params.module, req.params.lesson, course.usecase)
        }

        // Next link in pagination?
        let next: Pagination | undefined = lesson.next

        if (!next && course.completed) {
            next = {
                title: 'Course Summary',
                link: `${course.link}summary/`
            }
        }

        // Emit user viewed lesson
        emitter.emit(new UserViewedLesson(user as User, course, module, lesson))

        // Mark as read if there are no questions
        if (lesson.questions.length === 0 && lesson.completed === false) {
            await saveLessonProgress(user as User, course.slug, module.slug, lesson.slug, [], token)
        }

        // Has slides
        const slides = /class=".*slide.*"/.test(doc)

        res.render('course/lesson', {
            classes: `lesson ${req.params.course}-${req.params.module}-${req.params.lesson} ${course.completed ? 'course--completed' : ''} lesson--${lesson.type} ${lesson.completed ? 'lesson--completed' : ''} ${lesson.optional ? 'lesson--optional' : 'lesson--mandatory'} ${slides ? 'lesson--slides' : ''}  ${lesson.sequential ? 'lesson--sequential' : ''}`,
            analytics: {
                course: {
                    slug: course.slug,
                    title: course.title,
                    summary: course.summary,
                    link: course.link,
                },
                module: {
                    slug: module.slug,
                    title: module.title,
                },
                lesson: {
                    slug: lesson.slug,
                    title: lesson.title,
                },
                user: {
                    id: (user as User).id,
                }
            },
            feedback: true,
            ...lesson,
            path: req.originalUrl,
            course,
            enrolled: course.enrolled,
            user,
            module,
            doc,
            next,
            showSandbox,
            sandboxUrl,
            sandboxVisible,
            summary: await courseSummaryExists(req.params.course),
            translate: translate(course.language),
            slides,
        })
    }
    catch (e) {
        nextfn(e)
    }
})

/**
 * @POST /:course/:module/:lesson/reset/
 *
 * Allow the user to reset the database themselves
 *
 */
router.post('/:course/:module/:lesson/reset/', requiresAuth(), /*requiresVerification,*/ async (req, res, nextfn) => {
    try {
        const user = await getUser(req)
        const token = await getToken(req)
        const course = await getCourseWithProgress(req.params.course, user)

        // If not enrolled, send to course home
        if (course.enrolled !== true) {
            return res.status(400).json({
                message: 'You are not enrolled to this course'
            })
        }

        const module = course.modules.find(row => row.slug === req.params.module)

        if (!module) {
            return res.status(404).json({
                message: `Could not find module ${req.params.module} of ${req.params.course}`
            })
        }

        else if (!module.lessons) {
            return res.status(404).json({
                message: `Could not find lessons for module ${req.params.module} of ${req.params.course}`
            })
        }

        const lesson = module.lessons.find(row => row.slug === req.params.lesson)

        if (!lesson) {
            return res.status(404).json({
                message: `Could not find lesson ${req.params.lesson} in module ${req.params.module} of ${req.params.course}`
            })
        }

        // Reset Database?
        if (user && course.usecase && !lesson?.completed) {
            await resetDatabase(token, user, req.params.course, req.params.module, req.params.lesson, course.usecase)
        }

        // Next link in pagination?
        let next: Pagination | undefined = lesson.next

        if (!next && course.completed) {
            next = {
                title: 'Course Summary',
                link: `${course.link}summary/`
            }
        }

        // Emit user viewed lesson
        emitter.emit(new UserResetDatabase(user as User, course, module, lesson))

        res.status(202).json({
            message: `Database reset`
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
        const token = await getToken(req)
        const ref = getRef(req)
        const { course, module, lesson } = req.params
        const answers: Answer[] = req.body

        const user = await getUser(req)
        const output = await saveLessonProgress(user as User, course, module, lesson, answers, token, ref)

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

        const json = await saveLessonFeedback(user as User, course, module, lesson, req.body)

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
 * Static routing for module images
 */
router.use('/:course/:module/:lesson/:filename.cypher', (req, res, next) => {
    const { course, module, lesson, filename } = req.params
    const filepath = path.join(ASCIIDOC_DIRECTORY, 'courses', course, 'modules', module, 'lessons', lesson, `${filename}.cypher`)

    if (existsSync(filepath)) {
        const contents = readFileSync(filepath)

        const output = contents.toString()
            .split("\n")
            .filter(line => !line.startsWith("//"))
            .join("\n")

        return res.send(output)
    }
    else {
        next(new NotFoundError(`The file ${filename}.cypher doesn't exist for this lesson`))
    }
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

        const outcome = await verifyCodeChallenge(user as User, token, course, module, lesson)

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
        const token = await getToken(req)
        const user = await getUser(req)

        const outcome = await saveLessonProgress(user as User, course, module, lesson, [], token, undefined, true)

        res.json(outcome)
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET  /:course/:module/:lesson/lab
 *
 * Labs are hands-on coding challenges served through Gitpod.
 * This URL
 *
 */
router.get('/:course/:module/:lesson/lab', requiresAuth(), async (req, res, nextfn) => {
    try {
        const user = await getUser(req) as User
        const token = await getToken(req)
        const course = await getCourseWithProgress(req.params.course, user)
        const sandbox = await getSandboxForUseCase(token, user, course.usecase as string)

        // If not enrolled, send to course home
        if (course.enrolled !== true) {
            req.flash('info', 'You must be enrolled to view this content')

            return res.redirect(`/courses/${req.params.course}/`)
        }

        if (!course.usecase) {
            return nextfn(new NotFoundError(`Could not find usecase for course ${req.params.course}`))
        }

        const module = course.modules.find(row => row.slug === req.params.module)

        if (!module) {
            return nextfn(new NotFoundError(`Could not find module ${req.params.module} of ${req.params.course}`))
        }

        else if (!module.lessons) {
            return nextfn(new NotFoundError(`Could not find lessons for module ${req.params.module} of ${req.params.course}`))
        }
        const lesson = module.lessons.find(row => row.slug === req.params.lesson)

        if (!lesson) {
            return nextfn(new NotFoundError(`Could not find lesson ${req.params.lesson} in module ${req.params.module} of ${req.params.course}`))
        }
        else if (!lesson.lab || !course.repository) {
            return nextfn(new NotFoundError(`Could not find lab for lesson ${req.params.lesson} in module ${req.params.module} of ${req.params.course}`))
        }
        else if (!sandbox) {
            return nextfn(new NotFoundError(`Could not find sandbox for usecase ${course.usecase} : lesson ${req.params.lesson} in module ${req.params.module} of ${req.params.course}`))
        }

        // Build Repository URL
        const repositoryUrl = lesson.lab
            .replace('{repository-raw}', repositoryRawUrl(course.repository))
            .replace('{repository-blob}', repositoryBlobUrl(course.repository))
            .replace('{repository-link}', repositoryLink(course.repository))

        // Build Environment Variables
        const env = [
            `NEO4J_URI=${encodeURIComponent(`bolt://${sandbox.ip}:${sandbox.boltPort}`)}`,
            `NEO4J_USERNAME=${encodeURIComponent(sandbox.username)}`,
            `NEO4J_PASSWORD=${encodeURIComponent(sandbox.password)}`,
        ]

        if (course.allowsLLMCalls) {
            env.push(`OPENAI_API_KEY=${generateBearerToken(user, course.slug)}`)
        }

        // Redirect to gitpod
        const redirectTo = `https://gitpod.io/new#${env.join(',')}/${repositoryUrl}`

        res.redirect(redirectTo)
    }
    catch (e) {
        nextfn(e)
    }
})

/**
 * @GET  /:course/:module/:lesson/kgbuilder
 *
 * Labs are hands-on coding challenges served through Gitpod.
 * This URL
 *
 */
router.get('/:course/:module/:lesson/kgbuilder', requiresAuth(), async (req, res, nextfn) => {
    try {
        const user = await getUser(req) as User
        const token = await getToken(req)
        const course = await getCourseWithProgress(req.params.course, user)
        const sandbox = await getSandboxForUseCase(token, user, course.usecase as string)

        let redirectTo = `https://llm-graph-builder.neo4jlabs.com/`

        if (sandbox) {
            redirectTo = `${redirectTo}?connectURL=bolt://${sandbox.username}:${sandbox.password}@${sandbox.ip}:${sandbox.boltPort}`
        }

        return res.redirect(redirectTo)
    }
    catch (e) {
        nextfn(e)
    }
})

export default router
