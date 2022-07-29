import * as http from 'http';
import express, { RequestHandler, Router } from "express";
import forge from 'node-forge'
import { CLASSMARKER_SECRET } from "../../../constants";
import { notify } from "../../../middleware/bugsnag.middleware";
import { ClassmarkerResponseBody } from "./classmarker-response-body.interface";
import { ClassmarkerHeaderVerificationFailedError } from "./errors/classmarker-header-verification-failed.error";
import { ClassmarkerNoHeaderError } from "./errors/classmarker-no-header.error";
import { saveClassmarkerResult } from "./save-classmarker-result";

const router = Router()

function verifyData(body: string, headerHmacSignature: string, secret: string): boolean {
    const jsonHmac = computeHmac(body, secret);
    return jsonHmac === headerHmacSignature;
}

function computeHmac(body: string, secret: string): string {
    const hmac = forge.hmac.create();
    hmac.start('sha256', secret);
    const jsonBytes = Buffer.from(body, 'ascii');

    hmac.update(jsonBytes);
    return forge.util.encode64(hmac.digest().bytes());
}

declare module 'http' {
    interface IncomingMessage {
        rawBody: any;
    }
}

router.use(express.raw({
    verify: (req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string) => {
        if (buf && buf.length) {
            req.rawBody = buf.toString(encoding as BufferEncoding || 'utf8');
        }
    }, type: '*/*',
}) as RequestHandler)


router.post('/webhook', async (req, res) => {
    try {
        // Check for header
        const header = req.header("X-Classmarker-Hmac-Sha256")

        if (!header) {
            throw new ClassmarkerNoHeaderError(`No header passed using X-Classmarker-Hmac-Sha256`)
        }

        // Verify header
        if (!verifyData(req.rawBody, header, CLASSMARKER_SECRET)) {
            throw new ClassmarkerHeaderVerificationFailedError(
                `Invalid X-Classmarker-Hmac-Sha256 header`,
                header,
                computeHmac(req.body, CLASSMARKER_SECRET)
            )
        }

        const body: ClassmarkerResponseBody = req.body

        const { result, test } = body
        const { certificate_serial, passed, percentage, time_finished, view_results_url, } = result

        // Save Results
        await saveClassmarkerResult(
            result.cm_user_id,
            result.first,
            result.last,
            test.test_id,
            certificate_serial,
            passed,
            percentage,
            time_finished,
            view_results_url
        )

        res.sendStatus(201)
    }
    catch (e: any) {
        notify(e, event => {
            if (req.body?.result) {
                event.setUser(req.body.result.cm_user_id)
            }
            event.addMetadata('request', {
                body: req.body,
                headers: req.headers,
                rawBody: req.rawBody,
            })

            if (e.actual || e.expected) {
                event.addMetadata('hash', {
                    actual: e.actual,
                    expected: e.expected,
                })
            }
        })

        res.sendStatus(200)
    }
})

export default router
