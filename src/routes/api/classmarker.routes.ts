import bodyParser from "body-parser";
import express, { Request, Response, Router } from "express";
import forge from 'node-forge'
import { CLASSMARKER_SECRET } from "../../constants";
import { UserCompletedCourse } from "../../domain/events/UserCompletedCourse";
import { CourseWithProgress } from "../../domain/model/course";
import { User } from "../../domain/model/user";
import { appendParams, courseCypher } from "../../domain/services/cypher";
import { emitter } from "../../events";
import { notify } from "../../middleware/bugsnag.middleware";
import { write } from "../../modules/neo4j";

const router = Router()

function verifyData(body: object, headerHmacSignature: string, secret: string) {
    var jsonHmac = computeHmac(body, secret);
    return jsonHmac == headerHmacSignature;
}

function computeHmac(body: object, secret: string) {
    var hmac = forge.hmac.create();
    hmac.start('sha256', secret);
    var jsonString = JSON.stringify(body)
    var jsonBytes = Buffer.from(jsonString, 'ascii');

    hmac.update(jsonBytes);
    return forge.util.encode64(hmac.digest().bytes());
}


interface ClassmarkerResponseBody {
    test: {
        // :Course.classmarkerReference
        test_id: number;
        test_name: string;
    };
    group: {
        group_id: number;
        group_name: string;
    };
    result: {
        user_id: string;
        // :User.sub
        cm_user_id: string;
        first: string; // "Mary",
        last: string; // "Williams",
        email: string; // "mary@example.com",
        percentage: number; // 75,
        points_scored: number; // 9,
        points_available: number; // 12,
        requires_grading: string; // "Yes",
        time_started: number; // 1436263102,
        time_finished: number; // 1436263702,
        duration: string; // "00:0540",
        percentage_passmark: number; // 50,
        passed: boolean; // true,
        feedback: string; // "Thanks for completing our Exam!",
        give_certificate_only_when_passed: boolean; // false,
        certificate_url: string; // "https://www.classmarker.com/pdf/certificate/SampleCertificate.pdf",
        certificate_serial: string; // "CLPPYQSBSY-ZZVKJGQH-XHWMMRCHYT",
        view_results_url: string; // "https://www.classmarker.com/view/results/?required_parameters_here"
    };
}

async function saveClassmarkerResult(sub: string, first: string, last: string, classmarkerId: number, certificateSerial: string, passed: boolean, percentage: number, timeFinished: number, viewResultsUrl: string): Promise<void> {
    const res = await write(`
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c {classmarkerId: $classmarkerId})
        WHERE e.createdAt >= datetime() - duration('PT2H')

        SET 
            u.classmarkerFirstName = $first,
            u.classmarkerLastName = $last,
            e:FromCommunityGraph,
            e.updatedAt = datetime(),
            e.certificateNumber = $certificateSerial,
            e.percentage = $percentage,
            e.classmarkerResultsUrl = $viewResultsUrl,
            e.attempts = coalesce(e.attempts, 0) + 1,
            e.lastSeenAt = datetime()

        FOREACH (_ IN CASE WHEN $passed THEN [1] ELSE [] END |
            SET e:CompletedEnrolment,
                e.completedAt = datetime({epochSeconds: toInteger($timeFinished)})
        )

        FOREACH (_ IN CASE WHEN NOT $passed THEN [1] ELSE [] END |
            SET e:FailedEnrolment,
                e.failedAt = datetime({epochSeconds: toInteger($timeFinished)})
        )

        RETURN u,
            ${courseCypher('e', 'u')} AS course
    `, appendParams({ sub, 
        first, 
        last, 
        classmarkerId: classmarkerId.toString(), 
        certificateSerial, 
        passed, 
        percentage, 
        timeFinished, 
        viewResultsUrl,
    }))

    const [ record ] = res.records

    const user: User = record.get('u')
    const course: CourseWithProgress = record.get('course')

    if ( passed ) {
        emitter.emit(new UserCompletedCourse(user, course, undefined))
    }
}

router.post('/webhook', async (req, res, next) => {
    try {
        // Check for header
        if (!req.header("X-Classmarker-Hmac-Sha256")) {
            return res.status(404)
        }

        // Verify header
        if (!verifyData(req.body, req.header("X-Classmarker-Hmac-Sha256")!, CLASSMARKER_SECRET)) {
            return res.sendStatus(400)
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
    }
    catch (e: any) {
        notify(e)

        next(e)
    }
})

export default router
