import { Request, Response, NextFunction, Router } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { CourseWithProgress } from '../domain/model/course'
import { EnrolmentsByStatus, EnrolmentStatus, STATUS_AVAILABLE, STATUS_COMPLETED, STATUS_ENROLLED, STATUS_INTERESTED } from '../domain/model/enrolment'
import { Pagination } from '../domain/model/pagination'
import { deleteUser } from '../domain/services/delete-user'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { updateUser } from '../domain/services/update-user'
import { getToken, getUser } from '../middleware/auth'
import { notify } from '../middleware/bugsnag'
import { getSandboxes, Sandbox } from '../modules/sandbox'

const router = Router()

/**
 * Account Breadcrumbs
 */
 router.use((req, res, next) => {
    res.locals.breadcrumbs = [
        {
            link: '/',
            text: 'Neo4j GraphAcademy',
        },
        {
            link: '/account',
            text: 'My Account',
        },
    ]

    next()
})

/**
 * @GET /account/
 *
 * Display user account details
 */
router.get('/', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)
        const token = await getToken(req)

        // Get Sandboxes
        const sandboxes: Sandbox[] = await getSandboxes(token)

        res.render('account/edit', {
            title: 'My Account',
            hero: {
                title: 'My Account',
            },
            user,
            sandboxes,
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @POST /account/
 *
 * Update user details
 */
router.post('/', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)

        // TODO: Validation
        const { nickname, givenName, position, company } = req.body

        await updateUser(user!, { nickname, givenName, position, company })

        req.flash('success', 'Your personal information has been updated')

        res.redirect(req.params.returnTo || '/account')
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /account/delete/
 *
 * Delete the user's account, log them out and then send them to
 * the account deleted page
 */
router.post('/delete', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req)

        await deleteUser(user!)

        // @ts-ignore
        res.oidc.logout({ returnTo: '/account/deleted' })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /account/deleted/
 *
 * Show a confirmation to the user that their account has been deleted
 */
router.get('/deleted', (req, res, next) => {
    try {
        res.render('account/deleted', {
            title: 'Account Deleted',
            hero: {
                overline: `We're sorry to see you go`,
                title: 'Account Deleted',
            },
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /account/courses/ ?:course
 * Show a list of users enrolments and their bookmarked courses
 */

const courseHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getUser(req)

        const status: EnrolmentStatus = (req.params.status || STATUS_ENROLLED) as EnrolmentStatus

        const links: Pagination[] = [
            { title: 'Enrolled', link: `/account/courses/${STATUS_ENROLLED}`, current: status === STATUS_ENROLLED },
            { title: 'Bookmarked', link: `/account/courses/${STATUS_INTERESTED}`, current: status === STATUS_INTERESTED },
            { title: 'Completed', link: `/account/courses/${STATUS_COMPLETED}`, current: status === STATUS_COMPLETED },
            { title: 'Available', link: `/account/courses/${STATUS_AVAILABLE}`, current: status === STATUS_AVAILABLE },
        ]

        let result: EnrolmentsByStatus
        try {
            result = await getUserEnrolments(user!.sub)
        }
        catch (e: any) {
            notify(e, event => {
                event.setUser(user?.sub, user?.email, user?.name)
            })

            result = { enrolments: {} } as EnrolmentsByStatus
        }

        const courses: CourseWithProgress[] = (result.enrolments[status] || []) as CourseWithProgress[]

        let title = 'My Courses'
        switch (status) {
            case STATUS_ENROLLED:
                title = 'My Enrolled Courses'
                break;
            case STATUS_INTERESTED:
                title = 'My Bookmarked Courses'
                break;
            case STATUS_COMPLETED:
                title = 'Completed Courses'
                break;
            case STATUS_AVAILABLE:
                title = 'Available Courses'
                break;
        }

        res.locals.breadcrumbs.push({
            link: req.originalUrl,
            text: title,
        })

        res.render('account/courses', {
            title,
            hero: {
                title,
                overline: 'My Courses',
            },

            user,
            links,
            courses,
        })
    }
    catch (e) {
        next(e)
    }
}

router.get('/courses', requiresAuth(), courseHandler)
router.get('/courses/:status', requiresAuth(), courseHandler)

export default router
