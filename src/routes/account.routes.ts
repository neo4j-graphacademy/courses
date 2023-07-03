import { Request, Response, NextFunction, Router } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { PRINTFUL_STORE_ID } from '../constants'
import { UserExecutedQuery } from '../domain/events/UserExecutedQuery'
import { UiEventType, UI_EVENTS, UserUiEvent } from '../domain/events/UserUiEvent'
import { EnrolmentsByStatus, EnrolmentStatus, STATUS_COMPLETED, STATUS_ENROLLED, STATUS_FAVORITED } from '../domain/model/enrolment'
import { Pagination } from '../domain/model/pagination'
import { User } from '../domain/model/user'
import { deleteUser } from '../domain/services/delete-user'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import getRewards, { Reward } from '../domain/services/rewards/get-rewards'
import { updateUser, UserUpdates } from '../domain/services/update-user'
import NotFoundError from '../errors/not-found.error'
import { emitter } from '../events'
import { getToken, getUser, requestEmailVerification } from '../middleware/auth.middleware'
import { notify } from '../middleware/bugsnag.middleware'
import { getProduct, getCountries, formatRecipient, getCountryAndState } from '../modules/printful/printful.module'
import { getCountries as getCountriesAsRecord } from '../utils'
import createVariantOrder from '../modules/printful/services/create-variant-order.service'
import { setUserProfileVisibility } from '../domain/services/set-user-profile-visibility'

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
        const user = await getUser(req) as User
        const countries = await getCountriesAsRecord()

        res.render('account/edit', {
            title: 'My Account',
            // hero: {
            //     title: 'My Account',
            // },
            user,
            countries,
            classes: 'account',
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /account/complete/
 *
 * Prompt the user to enter their details or explicitly skip
 */
router.get('/complete', requiresAuth(), async (req, res) => {
    const user = await getUser(req)
    const countries = await getCountriesAsRecord()

    res.render('account/complete', {
        title: 'Complete Account | My Account',
        // hero: {
        //     title: 'Complete Your Account',
        //     byline: 'We would like to know more about you.',
        // },
        user,
        countries,
        classes: 'account',
        returnTo: req.query.returnTo || '/account/'
    })
})

/**
 * @GET /account/skip
 *
 * Skip the account completion step
 */
router.get('/skip', requiresAuth(), async (req, res, next) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req) as User

        await updateUser(token, user, {} as UserUpdates)

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
router.post('/', requiresAuth(), async (req, res, next) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req) as User

        // TODO: Validation
        const { nickname, givenName, position, company, country, unsubscribe, bio } = req.body

        const unsubscribed = unsubscribe === 'true'

        await updateUser(token, user, { nickname, givenName, position, company, country, unsubscribed, bio })

        req.flash('success', 'Your personal information has been updated')

        res.redirect(req.body.returnTo || '/account/')
    }
    catch (e) {
        next(e)
    }
})

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
            { title: 'Favorites', link: `/account/courses/${STATUS_FAVORITED}`, current: status === STATUS_FAVORITED },
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
            case STATUS_FAVORITED:
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
    try {
        if (!PRINTFUL_STORE_ID) {
            throw new NotFoundError('Store not found')
        }

        const user = await getUser(req) as User
        const rewards = await getRewards(user)
        const reward = rewards.find(reward => reward.slug === req.params.slug)

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
    catch (e) {
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.errors = e.response?.data?.errors
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.errorMessage = e.response?.data?.result || e.message

        res.status(e.code || 500)

        await redeemForm(req, res, next)
    }
})

export default router
