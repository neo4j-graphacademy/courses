import express, { Router } from 'express'
import { ASCIIDOC_DIRECTORY, BASE_URL, CDN_URL } from '../../constants'
import { forceTrailingSlash } from '../../middleware/trailing-slash.middleware'
import { convert, convertCertificationOverview, loadFile } from '../asciidoc'
import getCertifications from '../../domain/services/get-certifications'
import { canonical, cleanAnswerInput } from '../../utils'
import { getUser } from '../../middleware/auth.middleware'
import { UserViewedCourse } from '../../domain/events/UserViewedCourse'
import { emitter } from '../../events'
import startCertification from './services/start-certification'
import { requiresAuth } from 'express-openid-connect'
import { User } from '../../domain/model/user'
import { getRef, getTeam } from '../../middleware/save-ref.middleware'
import { CertificationStatus, NextCertificationAction } from './services/check-existing-attempts'
import getCertificationStatus from './services/get-certification-status'
import saveAnswer from './services/save-answer'
import { certificationOgBannerImage } from '../../routes/route.utils'
import getQuestionHTML from './services/get-question-html'
import getCertificationResults from './services/get-certification-results'
import getCertification from './services/get-certification'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import NotFoundError from '../../errors/not-found.error'

const router = Router({
    caseSensitive: true,
})

const ERROR_ATTEMPTS_EXCEDED = 'You can only attempt the certification once every 24 hours.'
const ERROR_TIMES_UP = 'Time is up.  Here are your results.'

router.get(`/`, forceTrailingSlash, async (req, res, next) => {
    try {
        const file = loadFile(`pages/certification.adoc`)
        const certifications = await getCertifications()

        res.render('certification', {
            hero: {
                title: file.getTitle(),
                // overline: file.getAttribute('overline'),
                byline: file.getAttribute('caption'),
            },
            canonical: canonical(req.originalUrl),
            title: file.getTitle(),
            content: file.getContent(),
            certifications: certifications.reverse(),
            classes: 'certifications',
            ogImage: CDN_URL
                ? `${CDN_URL}/img/categories/banners/certification.png`
                : `${BASE_URL}/img/og/og-categories.png`,
        })
    } catch (e) {
        next(e)
    }
})

router.get(`/:slug`, forceTrailingSlash, async (req, res, next) => {
    try {
        const { slug } = req.params
        const user = await getUser(req)

        const { course, updatedAt, ...status } = await getCertification(slug, user)

        const updated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt

        if (course === undefined) {
            return next(new NotFoundError(`Could not find certification ${slug}`))
        }

        // Emit user viewed course
        if (user) {
            emitter.emit(new UserViewedCourse(user, course))
        }

        const doc = await convertCertificationOverview(course.slug)

        res.render('certification/overview', {
            classes: `course ${course.certification ? 'certification' : ''} ${course.slug} ${status.passed ? 'course--completed' : ''
                }`,

            // For analytics.pug
            analytics: {
                course: {
                    slug: course.slug,
                    title: course.title,
                    link: course.link,
                },
                user: {
                    id: user?.id,
                },
            },

            course,
            title: `${course.title}`,
            canonical: canonical(course.link),
            // ...course,

            ogDescription: course.caption,
            ogTitle: `Take the ${course.title} with Neo4j GraphAcademy`,
            ogImage: certificationOgBannerImage(course.slug),

            doc,
            feedback: true,
            ...status,
            updatedAt: updated,
        })
    } catch (e) {
        next(e)
    }
})

/**
 * @GET /:slug/illustration
 *
 * Find and send the illustration.svg file in the course root
 */
router.get('/:slug/illustration', (req, res) => {
    try {
        let filePath = path.join(ASCIIDOC_DIRECTORY, 'certifications', req.params.slug, 'illustration.svg')

        if (!existsSync(filePath)) {
            filePath = path.join(__dirname, '..', '..', '..', 'resources', 'svg', 'illustrationDefault.svg')
        }

        res.header('Content-Type', 'image/svg+xml')

        res.sendFile(filePath)
    } catch (e) {
        return '<svg></svg>'
        // next(e)
    }
})


/**
 * @GET /:slug/introduction
 *
 * Serve the introduction.adoc file for the certification
 */
router.get('/:slug/introduction', requiresAuth(), async (req, res, next) => {
    try {
        const { slug } = req.params;

        // If introduction doesn't exist, take them straight to the exam
        const introPath = path.join('certifications', slug, 'introduction.adoc');
        if (!existsSync(path.join(ASCIIDOC_DIRECTORY, introPath))) {
            return res.send('no intro ' + introPath)
            // return res.redirect(`/certifications/${slug}/enrol/`)
        }
        const file = loadFile(introPath);
        const doc = convert(file);

        res.render('certification/introduction', {
            classes: 'exam--introduction',
            course: { slug },
            title: file.getTitle(),
            doc,
            showSandbox: true,
            sandboxUrl: '../browser/',
        });
    } catch (e) {
        next(e);
    }
});

// router.post('/:slug/enrol', (req, res) => {
router.get('/:slug/enrol', requiresAuth(), async (req, res) => {
    // Check for active enrolment
    // - if in progress, go to /exam
    // - if created at more than an hour ago - redirect to /certifications/:slug with flash
    // - if an attempt exists in the last day - redirect to /certifications/:slug with flash

    // else
    // - create the enrolment node
    // - assign random questions based on weighting
    // -  redirect to /certifications/:slug/:exam

    const { slug } = req.params
    const user = (await getUser(req)) as User
    const ref = getRef(req)
    const team = getTeam(req)

    const { action } = await startCertification(slug, user, ref, team)

    if (action === NextCertificationAction.ATTEMPTS_EXCEDED) {
        req.flash('info', ERROR_ATTEMPTS_EXCEDED)

        return res.redirect(`/certifications/${slug}/`)
    } else if (action === NextCertificationAction.SUCCEEDED) {
        return res.redirect(`/certifications/${slug}/results/`)
    } else {
        return res.redirect(`/certifications/${slug}/exam/`)
    }
})

const displayQuestion = async (req, res, user: User, status: CertificationStatus) => {
    const { slug } = req.params

    // If complete, send to results page
    if (status.action === NextCertificationAction.COMPLETE) {
        res.redirect(`/certifications/${slug}/results/`)
    } else if (status.action === NextCertificationAction.ATTEMPTS_EXCEDED) {
        req.flash('info', ERROR_TIMES_UP)
        res.redirect(`/certifications/${slug}/results/`)
    }
    // If continue,
    else if (
        status.action === NextCertificationAction.CONTINUE &&
        typeof status.course.slug === 'string' &&
        typeof status.question !== 'undefined'
    ) {
        const { title, role, html } = await getQuestionHTML(status.course.slug, status.question.id)

        res.render('certification/exam', {
            ...status,
            user,
            showSandbox: status.question?.sandbox,
            sandboxUrl: '../browser/',
            question: {
                ...status.question,
                title,
                role,
                html,
            },
            title: title,
        })
    }
    // If there isn't an active certification attempt, return to home page
    else {
        res.redirect(`/certifications/${slug}/`)
    }
}

router.get('/:slug/browser', requiresAuth(), async (req, res) => {
    const browserDist = path.join(__dirname, '..', '..', '..', 'browser', 'dist')

    const html = readFileSync(path.join(browserDist, 'index.html'))
        .toString()
        .replace('</body>', `\n<script nonce="${res.locals.nonce}">`)
        .replace('</head>', `\n<base href="/browser/"></head>`)

    res.send(html)
})

router.get('/:slug/exam', requiresAuth(), async (req, res) => {
    // Select a question from the next level at random
    const { slug } = req.params
    const user = (await getUser(req)) as User

    const status = await getCertificationStatus(slug, user)

    void displayQuestion(req, res, user, status)
})

router.post('/:slug/exam', requiresAuth(), async (req, res, next) => {
    try {
        const { slug } = req.params
        const user = (await getUser(req)) as User

        const { id } = req.body
        let { answer, answers } = req.body

        // TODO: Validation
        if (answers === undefined && answer === undefined) {
            req.flash('info', 'Please provide an answer')
            res.redirect(req.originalUrl)
            return
        }

        // Multiple choice questions
        if (typeof answers === 'string') {
            answers = [answers]
        } else if (answer !== undefined) {
            // Single choice input
            answers = [answer]
        }

        answers = answers.filter(e => !!e).map((answer) => cleanAnswerInput(answer))

        // Save the question answer
        const output = await saveAnswer(slug, user, id, answers)

        void displayQuestion(req, res, user, output)
    } catch (e) {
        next(e)
    }
})

router.get('/:slug/results', requiresAuth(), async (req, res) => {
    const { slug } = req.params
    const user = (await getUser(req)) as User

    const results = await getCertificationResults(slug, user)

    if (results === undefined) {
        return res.redirect(`/certifications/${slug}/`)
    }

    res.render('certification/results', {
        ...results,
        updatedAt: results?.updatedAt ? new Date(results.updatedAt) : undefined,
    })
})


// Serve images statically for each certification
router.use('/:slug/images', (req, res, next) => {
    const { slug } = req.params;
    const imagesPath = path.join(ASCIIDOC_DIRECTORY, 'certifications', slug, 'images');
    express.static(imagesPath, {
        fallthrough: true,
    })(req, res, next);
});

export default router
