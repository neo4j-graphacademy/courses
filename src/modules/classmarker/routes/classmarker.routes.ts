import { Router } from "express";
import { notify } from "../../../middleware/bugsnag.middleware";
import { ClassmarkerResponseBody } from "../types/classmarker-response-body.interface";
import { saveClassmarkerResult } from "../services/save-classmarker-result";
import verifyClassmarkerSignature from "../middleware/verify-classmarker-signature.middleware";

const router = Router()

router.post('/webhook', verifyClassmarkerSignature, async (req, res) => {
    try {
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

            if (e.params) {
                event.addMetadata('query', {
                    params: e.params,
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
