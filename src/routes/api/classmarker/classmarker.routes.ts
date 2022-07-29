import * as http from 'http';
import express, { RequestHandler, Router } from "express";
import { CLASSMARKER_SECRET } from "../../../constants";
import { notify } from "../../../middleware/bugsnag.middleware";
import { ClassmarkerResponseBody } from "./classmarker-response-body.interface";
import { ClassmarkerHeaderVerificationFailedError } from "./errors/classmarker-header-verification-failed.error";
import { ClassmarkerNoHeaderError } from "./errors/classmarker-no-header.error";
import { saveClassmarkerResult } from "./save-classmarker-result";
import { CLASSMARKER_SIGNATURE_HEADER, computeHmac, verifyData } from './classmarker.utils';

const router = Router()

router.post('/webhook', async (req, res) => {
    try {
        // Check for header
        const header = req.header(CLASSMARKER_SIGNATURE_HEADER)

        if (!header) {
            throw new ClassmarkerNoHeaderError(`Header missing from request`)
        }

        // Verify header
        if (!verifyData(req.body, header, CLASSMARKER_SECRET)) {
            throw new ClassmarkerHeaderVerificationFailedError(
                `Invalid signature provided`,
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

        res.status(201).json({
            status: 'ok',
            message: 'Enrolment updated'
        })
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

        res.status(200).send({
            status: 'error',
            message: e.message,
        })
    }
})

export default router
