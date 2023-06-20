import { NextFunction, Request, Response } from "express";


export async function maintenance(req: Request, res: Response, next: NextFunction) {
    res.status(503).render('simple', {
        title: 'Scheduled maintenance',
        hero: {
            title: 'Scheduled maintenance ',
            byline: '09:00 - 12:00 UTC',
        },
        content: `<p>GraphAcademy is currently undergoing scheduled maintenance from 09:00 until 12:00 UTC.  Please check back shortly.</p>`,
        action: {
            link: 'https://neo4j.com/docs/',
            text: 'Read the docs'
        }
    })
}