import { Request, Response, NextFunction } from 'express'
import { CLASSMARKER_SECRET } from '../../../constants'
import { notify } from '../../../middleware/bugsnag.middleware'
import { ClassmarkerHeaderVerificationFailedError } from '../errors/classmarker-header-verification-failed.error'
import { ClassmarkerNoHeaderError } from '../errors/classmarker-no-header.error'
import { CLASSMARKER_SIGNATURE_HEADER, computeHmac, verifyData } from '../utils/classmarker.utils'

export default function verifyClassmarkerSignature(req: Request, res: Response, next: NextFunction) {
    // TODO: Reinstate verification of classmarker signature
    return next()

    // try {
    //     const header = req.header(CLASSMARKER_SIGNATURE_HEADER)

    //     // Check for header existence
    //     if (!header) {
    //         throw new ClassmarkerNoHeaderError(`Header missing from request`)
    //     }

    //     // Verify header
    //     if (!verifyData(req.body, header as string, CLASSMARKER_SECRET)) {
    //         throw new ClassmarkerHeaderVerificationFailedError(
    //             `Invalid signature provided`,
    //             header as string,
    //             computeHmac(req.body, CLASSMARKER_SECRET)
    //         )
    //     }

    //     // All good, allow the request to continue
    //     next()
    // }
    // catch(e: any) {
    //     // On error, notify bugsnag and send 200 anyway
    //     notify(e, event => {
    //         if (req.body?.result) {
    //             event.setUser(req.body.result.cm_user_id)
    //         }
    //         event.addMetadata('request', {
    //             body: req.body,
    //             headers: req.headers,
    //         })

    //         if (e.actual || e.expected) {
    //             event.addMetadata('hash', {
    //                 actual: e.actual,
    //                 expected: e.expected,
    //             })
    //         }

    //         if (e.params) {
    //             event.addMetadata('query', {
    //                 params: e.params,
    //             })
    //         }
    //     })

    //     res.status(200).send({
    //         status: 'error',
    //         message: e.message,
    //     })
    // }
}