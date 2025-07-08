import { Request, Response, NextFunction, Router } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { PRINTFUL_STORE_ID } from '../constants'
import { UserExecutedQuery } from '../domain/events/UserExecutedQuery'
import { UiEventType, UI_EVENTS, UserUiEvent, UI_EVENT_HIDE_SIDEBAR, UI_EVENT_SHOW_SIDEBAR, UI_EVENT_SHOW_TRANSCRIPT, UI_EVENT_SHOW_VIDEO } from '../domain/events/UserUiEvent'
import { EnrolmentsByStatus, EnrolmentStatus, STATUS_COMPLETED, STATUS_ENROLLED, STATUS_BOOKMARKED, STATUS_RECENTLY_COMPLETED } from '../domain/model/enrolment'
import { Pagination } from '../domain/model/pagination'
import { User } from '../domain/model/user'
import { deleteUser } from '../domain/services/delete-user'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import getRewards, { Reward } from '../domain/services/rewards/get-rewards'
import { AccountUpdateMethod, updateUser, UserUpdates } from '../domain/services/update-user'
import NotFoundError from '../errors/not-found.error'
import { emitter } from '../events'
import { getToken, getUser, requestEmailVerification } from '../middleware/auth.middleware'
import { notify } from '../middleware/bugsnag.middleware'
import { getProduct, getCountries, formatRecipient, getCountryAndState } from '../modules/printful/printful.module'
import { getCountry, getCountries as getCountriesAsRecord } from '../utils'
import createVariantOrder from '../modules/printful/services/create-variant-order.service'
import { setUserProfileVisibility } from '../domain/services/set-user-profile-visibility'
import { getTeam } from '../middleware/save-ref.middleware'
import getUserTeams from '../domain/services/teams/get-user-teams'
import leaveTeam from '../domain/services/teams/leave-team'
import joinTeam from '../domain/services/teams/join-team'
import createTeam from '../domain/services/teams/create-team'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import { Course, CourseWithProgress, CourseStatus, STATUS_ACTIVE, Language } from '../domain/model/course'
import { Module } from '../domain/model/module'
import { Category } from '../domain/model/category'
import { getDashboardData } from '../domain/services/get-dashboard-data'
import { getIllustration } from '../utils'

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
            link: '/account/',
            text: 'My Account',
        },
    ]

    next()
})

/**
 * @GET /account/
 *
 * Account dashboard
 *
 */
router.get('/', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User
        const dashboardData = await getDashboardData(user)

        if (dashboardData.enrolments.length === 0) {
            return res.redirect('/account/settings/')
        }

        // Get illustrations for all courses
        const illustrations: Record<string, string> = Object.fromEntries(
            await Promise.all(
                dashboardData.enrolments.map(
                    async e => {
                        const illustration = await getIllustration(e)
                        return [e.slug, illustration]
                    }
                )
            )
        )

        const rewards = await getRewards(user)


        res.render('account/dashboard', {
            title: 'Welcome back!',
            classes: 'account',
            ...dashboardData,
            rewards,
            illustrations
        })
    }
    catch (e) {
        next(e)
    }
})

const accountForm = async (req, res, next, vars = {}) => {
    try {
        const user = await getUser(req)
        const countries = await getCountriesAsRecord()

        const title = req.originalUrl.includes('complete') ? 'Complete Account | My Account' : 'My Account'
        const template = req.originalUrl.includes('complete') ? 'account/complete' : 'account/edit'

        res.render(template, {
            title,
            user,
            countries,
            classes: 'account',
            returnTo: req.query.returnTo || '/account/',
            input: {},
            ...vars,
            buttonText: req.originalUrl.includes('complete') ? 'Complete Account' : 'Save Changed',
            optin: req.originalUrl.includes('complete'),
        })
    }
    catch (e) {
        next(e)
    }
}

const processAccountForm = async (req, res, next) => {
    try {
        const token = await getToken(req)
        const team = getTeam(req)
        const user = await getUser(req) as User

        const { nickname, givenName, position, company, country, unsubscribe, bio } = req.body

        // Validation
        const required = ['nickname', 'givenName', 'country', 'position', 'company']
        const errors: string[] = []

        for (const key of required) {
            const value = req.body[key]

            if (value === undefined || !value || value.length < 2) {
                errors.push(`Please enter a valid ${key}`)
            }
        }

        // Unsubscribe from operational emails
        const unsubscribed = unsubscribe === 'true'

        const data: Record<string, any> = {
            nickname,
            givenName,
            position,
            company,
            country,
            unsubscribed,
            bio,
            method: AccountUpdateMethod.UPDATE,
        }

        // Also include opt-in information on account completion
        if (req.originalUrl.includes('complete')) {
            const countryInformation = await getCountry(country)

            if (countryInformation?.optin === 'soft') {
                // Soft opt-in, opt in unless they tick the box
                data.optin = req.body.soft === undefined
            }
            else if (countryInformation?.optin === 'required') {
                // Required opt-in, opt in if they tick the box
                data.optin = req.body.required !== undefined
            }
            else if (countryInformation?.optin === 'assumed') {
                // assumed opt-in, regardless
                data.optin = true
            }

            data.method = AccountUpdateMethod.COMPLETE
        }

        if (errors.length === 0) {
            await updateUser(data.method, token, user, data, team)

            req.flash('success', 'Your personal information has been updated')

            res.redirect(req.body.returnTo || '/account/settings/')
        }
        else {
            // Set error message and display form
            res.locals.error = 'Please try again'

            return accountForm(req, res, next, {
                errorMessage: '',
                errors,
                // body: req.body,
                input: req.body,
            })
        }

    }
    catch (e) {
        next(e)
    }
}

/**
 * @GET /account/
 *
 * Display user account details
 */
router.get('/settings', requiresAuth(), (req, res, next) => accountForm(req, res, next))

/**
 * @GET /account/complete/
 *
 * Prompt the user to enter their details or explicitly skip
 */
router.get('/complete', requiresAuth(), (req, res, next) => accountForm(req, res, next))

/**
 * @GET /account/skip
 *
 * Skip the account completion step
 */
router.get('/skip', requiresAuth(), async (req, res, next) => {
    // Disable skip button
    return res.redirect('/account/complete/')

    try {
        const token = await getToken(req)
        const team = getTeam(req)
        const user = await getUser(req) as User

        await updateUser(AccountUpdateMethod.COMPLETE, token, user, {} as UserUpdates, team)

        req.flash('success', 'Your personal information has been updated')

        res.redirect((req.query.returnTo || '/account/') as string)
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
router.post('/settings/', requiresAuth(), async (req, res, next) => processAccountForm(req, res, next))
router.post('/complete/', requiresAuth(), async (req, res, next) => processAccountForm(req, res, next))

/**
 * @GET /account/verify
 */
router.get('/verify', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User
        await requestEmailVerification(user)

        res.render('simple', {
            title: 'Verification Email Sent',
            hero: {
                title: 'Verification Email Sent',
                overline: 'Email Verification',
            },
            content: `<p>We have sent you a new verification email.  If you don't receive it shortly, please check your junk or spam folder before requesting a new verification email.</p>`,
            action: {
                link: '/account/verify/',
                text: 'Resend Verification Email'
            },
            classes: 'account',
        })
    }
    catch (e) {
        next(e)
    }
})

router.post('/profile', async (req, res) => {
    const hide = req.body.hide === 'true'

    const user = await getUser(req) as User

    await setUserProfileVisibility(user.sub, hide)

    req.flash('success', `Your public profile has been set ${hide ? 'hidden' : 'visible'}.`)
    res.redirect(req.body.returnTo || '/account/')
})

/**
 * @GET /account/delete/
 *
 * Delete the user's account, log them out and then send them to
 * the account deleted page
 */
router.post('/delete', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User

        await deleteUser(user)

        // await res.oidc.logout({ returnTo: '/account/deleted/' })

        res.redirect('https://preferences.neo4j.com/privacy')
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
// router.get('/deleted', (req, res, next) => {
//     try {
//         res.render('account/deleted', {
//             title: 'Account Deleted',
//             hero: {
//                 overline: `We're sorry to see you go`,
//                 title: 'Account Deleted',
//             },
//         })
//     }
//     catch (e) {
//         next(e)
//     }
// })

/**
 * @GET /account/courses/ ?:status
 * Show a list of users enrolments and their bookmarked courses
 */
const courseHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getUser(req) as User

        const status: EnrolmentStatus = (req.params.status || STATUS_ENROLLED) as EnrolmentStatus

        const links: Pagination[] = [
            { title: 'In Progress', link: `/account/courses/`, current: status === STATUS_ENROLLED },
            { title: 'Completed', link: `/account/courses/${STATUS_COMPLETED}`, current: status === STATUS_COMPLETED },
            { title: 'Favorites', link: `/account/courses/${STATUS_BOOKMARKED}`, current: status === STATUS_BOOKMARKED },
        ]

        let result: EnrolmentsByStatus
        try {
            result = await getUserEnrolments(user.sub, 'sub', undefined, false)
        }
        catch (e: any) {
            notify(e, event => {
                event.setUser(user?.sub, user?.email, user?.name)
            })

            result = { enrolments: {} } as EnrolmentsByStatus
        }

        const courses = (result.enrolments[status] || [])

        let title = 'My Courses'
        switch (status) {
            case STATUS_ENROLLED:
                title = 'My Enrolled Courses'
                break;
            case STATUS_BOOKMARKED:
                title = 'My Bookmarked Courses'
                break;
            case STATUS_COMPLETED:
                title = 'Completed Courses'
                break;
        }

        res.locals.breadcrumbs.push({
            link: req.originalUrl,
            text: title,
        })

        res.render('account/courses', {
            title,
            // hero: {
            //     title,
            //     overline: 'My Courses',
            // },
            classes: 'account courses',
            status,
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

/**
 * @POST /account/event/:type
 *
 * Handle a new event posted from the UI
 *
 */
router.post('/event/:type', requiresAuth(), async (req, res, next) => {
    const type: UiEventType = req.params.type as UiEventType

    if (!UI_EVENTS.includes(type)) {
        next(new NotFoundError('unknown event'))
    }

    try {
        const user = await getUser(req) as User
        const meta = req.body

        emitter.emit(
            new UserUiEvent(
                user,
                type,
                meta
            )
        )

        // Show or hide the sidebar
        if (type === UI_EVENT_HIDE_SIDEBAR || type === UI_EVENT_SHOW_SIDEBAR) {
            req.session['classroomHideSidebar'] = type === UI_EVENT_HIDE_SIDEBAR

            await updateUser(AccountUpdateMethod.UPDATE, '', user, {
                sidebarHidden: type === UI_EVENT_HIDE_SIDEBAR
            })
        }

        // Read or watch?
        if (type === UI_EVENT_SHOW_TRANSCRIPT || type === UI_EVENT_SHOW_VIDEO) {
            req.session['prefersTranscript'] = type === UI_EVENT_SHOW_TRANSCRIPT

            await updateUser(AccountUpdateMethod.UPDATE, '', user, {
                prefersTranscript: type === UI_EVENT_SHOW_TRANSCRIPT
            })
        }

        res.status(201).send({ status: 'created' })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @POST /account/query
 *
 * Log a query executed
 *
 */
router.post('/cypher', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User
        const { meta } = req.body

        emitter.emit(
            new UserExecutedQuery(
                user,
                meta,
            )
        )

        res.status(201).send({ status: 'created' })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /account/rewards
 *
 * List rewards for completing courses & certifications
 */
router.get('/rewards', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User
        const rewards = await getRewards(user)

        res.locals.breadcrumbs.push({
            link: req.originalUrl,
            text: 'Your Rewards',
        })

        res.render('account/rewards', {
            title: 'Rewards',
            rewards,
            classes: 'account',
        })
    }
    catch (e) {
        next(e)
    }
})

const redeemForm = async (req, res, next) => {
    let user, reward
    try {
        if (!PRINTFUL_STORE_ID) {
            throw new NotFoundError('Store not found')
        }

        user = await getUser(req) as User
        const rewards = await getRewards(user)
        reward = rewards.find(reward => reward.slug === req.params.slug)

        if (!reward) {
            throw new NotFoundError('Reward Not Found')
        }

        // Get Product Variants
        const productIds = reward.productId.split(',')
        let products

        try {
            products = await Promise.all(productIds.map(async (id: string) => {
                const product: any = await getProduct(PRINTFUL_STORE_ID as string, id)
                const variants = product.sync_variants.reduce((acc: any[], value) => {
                    const name = value.name.split('/', 1)[0]

                    let index = acc.findIndex((row) => row.name === name)

                    if (index === -1) {
                        acc.push({
                            name,
                            variants: []
                        })

                        index = acc.findIndex((row) => row.name === name)
                    }

                    value.preview = value.files.find(file => file.type === 'preview')?.preview_url

                    acc[index].variants.push(value)

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return acc as any
                }, [])

                return {
                    product,
                    variants
                }
            }))
        }
        catch (e: any) {
            notify(e, err => {
                err.setUser(user.id, user.email, user.name)
                err.addMetadata('reward', reward)
                err.addMetadata('printful', {
                    store: PRINTFUL_STORE_ID,
                    productIds,
                })
            })

            throw new NotFoundError('Unable to fetch rewards')
        }

        // No products found?
        if (!products.length) {
            throw new NotFoundError('Reward Products Not Found')
        }

        // Breadcrumbs
        res.locals.breadcrumbs.push({
            link: '/account/rewards/',
            text: 'Your Rewards',
        })

        res.locals.breadcrumbs.push({
            link: req.originalUrl,
            text: reward.title,
        })

        // Countries
        const countries = await getCountries()

        res.render('account/printful-form', {
            title: `Redeem ${reward.title} | Rewards`,
            classes: 'account',
            // hero: {
            //     overline: 'Neo4j GraphAcademy',
            //     title: 'Your Rewards',
            //     byline: 'Claim rewards for completing courses and certifications on GraphAcademy'
            // },
            reward,
            products,
            countries,
            input: req.body || {},
            errorMessage: req.errorMessage,
            errors: req.errors || {},
        })
    }
    catch (e: any) {
        notify(e, event => {
            event.setUser(user?.id, user.email, user.name)
            event.addMetadata('reward', reward || {})
            event.addMetadata('order', {
                store: PRINTFUL_STORE_ID,
            })
        })
        next(e)
    }
}

router.get('/rewards/:slug', requiresAuth(), redeemForm)

router.post('/rewards/:slug', requiresAuth(), async (req, res, next) => {
    if (!PRINTFUL_STORE_ID) {
        next(new NotFoundError('Store not found'))
    }

    const user = await getUser(req) as User
    let reward: Reward | undefined

    // Format request body
    const { body } = req

    Object.keys(body).map(key => {
        if (body[key] === '') {
            delete body[key]
        }
    })

    try {
        const rewards = await getRewards(user)
        reward = rewards.find(reward => reward.slug === req.params.slug)

        if (!reward) {
            throw new NotFoundError('Reward Not Found')
        }

        // Find Country
        const { country, state } = await getCountryAndState(body.country, body.state)


        // Disallow certain countries
        const disallow = ['CN', 'RU']

        if (disallow.includes(country.code.toUpperCase())) {
            throw new Error('Redemption is not available in your region at this time.')
        }

        // const needAdditionalEnrolments = ['LK', 'IN']

        // if (disallow.includes(country.code.toUpperCase())) {
        //     throw new Error('Redemption is not available in your region at this time.')
        // }
        // else if (needAdditionalEnrolments.includes(country.code.toUpperCase())) {
        // Check for at least one completed enrolment
        const { enrolments } = await getUserEnrolments(user.sub, 'sub', undefined, false)

        if (!enrolments[STATUS_COMPLETED] || enrolments[STATUS_COMPLETED].length < 4) {
            throw new Error('Due to detected irregularities in some regions, users are now required to complete at least three course prior to redeeming this reward.');
        }
        // }

        // Build & Validate Recipient
        const recipient = formatRecipient(
            [body.first_name, body.last_name].join(' '),
            body.address1,
            body.address2,
            body.city,
            state?.code || body.state_text,
            state?.name || body.state_text,
            country.code,
            country.name,
            body.zip,
            body.phone,
            body.email,
            body.company,
            body.tax_number
        )

        // Place Order
        await createVariantOrder(user, reward, PRINTFUL_STORE_ID as string, recipient, body.variant_id, 1)

        // Redirect with confirmation
        req.flash('success', `Your order has been placed.  You should receive a confirmation email shortly.`)

        res.redirect('/account/rewards')
    }
    catch (e: any) {
        notify(e, event => {
            event.setUser(user.id, user.email, user.name)
            event.addMetadata('request', e.request)
            event.addMetadata('response', e.response)
            event.addMetadata('reward', reward || {})
            event.addMetadata('order', {
                store: PRINTFUL_STORE_ID,
                variant_id: body.variant_id
            })
        })

        if (e.response?.data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            req.errors = e.response?.data?.errors
        }
        else if (e.errors) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            req.errors = e.errors
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.errorMessage = e.response?.data?.result || e.message

        res.status(e.code || 500)

        await redeemForm(req, res, next)
    }
})

/**
 * GET /account/teams
 *
 * List all teams for the user
 */
const renderTeamsPage = async (req, res, tab = 'join', error?: string, errors = {}) => {
    const user = await getUser(req) as User
    const teams = await getUserTeams(user)

    res.render('account/teams', {
        title: `Teams`,
        classes: 'account',
        teams,
        tab,
        errors,
        body: req.body || {},
        messages: error ? [[error]] : []
    })
}

router.get('/teams', requiresAuth(), async (req, res) => {
    renderTeamsPage(req, res)
})

/**
 * POST /teams/
 *
 * Create a new public or private team
 *
 * {"name", "description", "public", "open"}
 */
router.post('/teams/', requiresAuth(), async (req, res, next) => {
    try {
        const user = await getUser(req) as User

        const { name, description, isPublic, open, } = req.body;

        const { errors, team } = await createTeam(user, name, description, isPublic === 'true', open === 'true')

        if (team !== undefined) {
            req.flash('success', 'Your team has been created')

            return res.redirect(`/teams/${team.id}/`);
        }

        return renderTeamsPage(req, res, 'create', 'Unable to create team', errors)
    }
    catch (e) {
        next(e);
    }
})

/**
 * POST /teams/join
 *
 * Attempt to join an open team, either public or private with a code.
 *
 * {"id": "neo4j-devrel", "pin": "1234"}
 */
router.post('/teams/join/', requiresAuth(), async (req, res) => {
    const user = await getUser(req) as User
    const { id, pin } = req.body

    if (typeof id === 'string' && typeof pin === 'string') {
        const { team, error } = await joinTeam(user, id, pin)

        if (error) {
            req.flash('danger', error)
        }
        else if (team) {
            req.flash('success', `You are now a member of ${team.name}!`)
        }
    }

    res.redirect('/account/teams/')
})

/**
 * POST /teams/:id/leave
 *
 * Leave a group
 */
router.post('/teams/:id/leave', requiresAuth(), async (req, res) => {
    const user = await getUser(req) as User
    const team = await leaveTeam(user, req.params.id)

    if (team !== undefined) {
        req.flash('success', `You have left ${team.name}`)
    }

    res.redirect('/account/teams/')
})

export default router
