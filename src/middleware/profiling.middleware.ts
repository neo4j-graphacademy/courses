/* eslint-disable */
import { Request, Response, NextFunction } from 'express'
import { PROFILING_ENABLED } from '../constants';

interface ProfileEvent {
    timestamp: Date;
    description: string;
}

declare global {
    namespace Express {
        interface Request {
            startTime: Date;
            endTime: Date;
            profilerEvents: ProfileEvent[];
            addProfileEvent: (event: ProfileEvent) => void;
        }
    }
}

export function startProfiling(req: Request, res: Response, next: NextFunction): void {
    if ( PROFILING_ENABLED ) {
        req.startTime = new Date()
        req.profilerEvents = []

        req.addProfileEvent = (event: ProfileEvent) => {
            req.profilerEvents.push(event)
        }

        // Overwrite render function
        const { render, json } = res

        // @ts-ignore
        res.render = (view, locals, cb) => {
            // @ts-ignore
            render.call(res, view, locals, cb)

            // @ts-ignore
            endProfiling(req, res)
        }

        // @ts-ignore
        res.json = (body) => {
            // @ts-ignore
            endProfiling(req, res)

            json.call(res, body)
        }
    }

    next()
}

export function endProfiling(req: Request, res: Response): void {
    if ( PROFILING_ENABLED && req.startTime ) {
        const endTime = new Date()

        const timeTaken: number = endTime.getTime() - req.startTime?.getTime();

        console.log(req.originalUrl, ': ', timeTaken, 'ms');
        if ( req.profilerEvents.length ) {
            console.table(req.profilerEvents)
        }
    }
}
