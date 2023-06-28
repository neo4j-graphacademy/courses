import { Transaction } from "neo4j-driver";
import { User } from "../../model/user";
import { Sandbox } from "../../model/sandbox";

export interface IntermediateEnrolment {
    id: string;
    enrolled: boolean;
    createdAt: Date;
    lastSeenAt: Date | undefined;
    completed: boolean;
    completedAt: Date | undefined;
    failed: boolean;
    failedAt: Date | undefined;
    availableAfter: Date | undefined;
    ref: string | undefined;
    completedCount: number;
    completedPercentage: number | string;
    certificateUrl: string | undefined;
    sandbox?: Sandbox;
    completedModules: string[];
    completedLessons: string[];
}

type DatabaseEnrolment = Omit<IntermediateEnrolment, 'createdAt' | 'completedAt' | 'failedAt' | 'availableAfter' | 'lastSeenAt'> & {
    createdAt: string,
    completedAt: string | undefined,
    failedAt: string | undefined,
    availableAfter: string | undefined,
    lastSeenAt: string,
}


export default async function getEnrolments(tx: Transaction, user: User, courseSlug: string): Promise<IntermediateEnrolment | undefined> {
    const res = await tx.run<{ enrolment: DatabaseEnrolment }>(`
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $slug})
        RETURN e {
            .*,
            completed: e:CompletedEnrolment,
            failed: NOT e:CompletedEnrolment AND e:FailedEnrolment,
            completedModules: [ (e)-[:COMPLETED_MODULE]->(m) | m.link ],
            completedLessons: [ (e)-[:COMPLETED_LESSON]->(l) | l.link ],
            certificateUrl: '/c/'+ e.certificateId +'/'
        }  AS enrolment
    `, { sub: user.sub, slug: courseSlug })

    if (res.records.length === 0) {
        return
    }

    const enrolment = res.records[0].get('enrolment')

    // Convert dates
    const output: IntermediateEnrolment = {
        ...enrolment,
        createdAt: new Date(enrolment.createdAt),
        completedAt: enrolment.completedAt ? new Date(enrolment.completedAt) : undefined,
        failedAt: enrolment.failedAt ? new Date(enrolment.failedAt) : undefined,
        availableAfter: enrolment.availableAfter ? new Date(enrolment.availableAfter) : undefined,
        lastSeenAt: new Date(enrolment.lastSeenAt),
    }

    console.log(output);


    return output
}
