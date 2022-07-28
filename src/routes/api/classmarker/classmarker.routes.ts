import bodyParser from "body-parser";
import express, { Request, Response, Router } from "express";
import forge from 'node-forge'
import { CLASSMARKER_SECRET } from "../../../constants";
import { UserCompletedCourse } from "../../../domain/events/UserCompletedCourse";
import { CourseWithProgress } from "../../../domain/model/course";
import { User } from "../../../domain/model/user";
import { appendParams, courseCypher } from "../../../domain/services/cypher";
import { emitter } from "../../../events";
import { notify } from "../../../middleware/bugsnag.middleware";
import { write } from "../../../modules/neo4j";
import { ClassmarkerResponseBody } from "./classmarker-response-body.interface";
import { ClassmarkerHeaderVerificationFailedError } from "./errors/classmarker-header-verification-failed.error";
import { ClassmarkerNoHeaderError } from "./errors/classmarker-no-header.error";
import { saveClassmarkerResult } from "./save-classmarker-result";

const router = Router()

function verifyData(body: object, headerHmacSignature: string, secret: string): boolean {
    const jsonHmac = computeHmac(body, secret);
    return jsonHmac === headerHmacSignature;
}

function computeHmac(body: object, secret: string): string {
    const hmac = forge.hmac.create();
    hmac.start('sha256', secret);
    const jsonString = JSON.stringify(body)
    const jsonBytes = Buffer.from(jsonString, 'ascii');

    hmac.update(jsonBytes);
    return forge.util.encode64(hmac.digest().bytes());
}


router.post('/webhook', async (req, res, next) => {
    try {
        // Check for header
        const header = req.header("X-Classmarker-Hmac-Sha256")

        if (!header) {
            throw new ClassmarkerNoHeaderError(`No header passed using X-Classmarker-Hmac-Sha256`)
        }

        // Verify header
        if (!verifyData(req.body, header, CLASSMARKER_SECRET)) {
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
