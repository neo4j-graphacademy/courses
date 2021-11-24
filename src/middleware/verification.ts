import { NextFunction, Request, Response } from 'express';
import { getUser } from './auth';

export async function requiresVerification(req: Request, res: Response, next: NextFunction) {
    const user = await getUser(req)

    if (user?.email_verified === false) {
        return res.status(401)
            .render('simple', {
                title: 'Email Verification Required',
                hero: {
                    title: 'Email Verification Required',
                    // byline: `It's our fault, not yours...`,
                    overline: 'Oops',
                },
                content: `<p>You will need to verify your email address before enrolling to any courses on GraphAcademy.</p>
                <p>Please verify your email by clicking on the link we sent you. If you haven't received any email yet, check your junk or spam folder.</p>`,
                action: {
                    link: '/account/verify/',
                    text: 'Resend Verification Email'
                }
            })
    }

    next()
}