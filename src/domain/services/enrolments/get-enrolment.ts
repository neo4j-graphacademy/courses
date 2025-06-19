import { ManagedTransaction } from "neo4j-driver";
import { User, ValidLookupProperty } from "../../model/user";
import { Instance } from "../../model/instance";
import { EnrolmentStatus, STATUS_COMPLETED, STATUS_ENROLLED, STATUS_FAILED, STATUS_BOOKMARKED } from "../../model/enrolment";
import { STATUS_AVAILABLE } from "../rewards/get-rewards";
import { appendParams } from "../cypher";
import { STATUS_ACTIVE } from "../../model/course";

export interface IntermediateEnrolment {
    id: string;
    status: EnrolmentStatus;
    courseSlug: string;
    enrolled: boolean;
    createdAt: Date;
    lastSeenAt: Date | undefined;
    completed: boolean;
    completedAt: Date | undefined;
    recentlyCompleted: boolean;
    failed: boolean;
    isInterested: boolean;
    percentage: number;
    failedAt: Date | undefined;
    availableAfter: Date | undefined;
    ref: string | undefined;
    completedCount: number;
    completedPercentage: number | string;
    certificateId: string | undefined;
    certificateUrl: string | undefined;
    sandbox?: Instance;
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


export default async function getEnrolments(tx: ManagedTransaction, user: Partial<User>, property: ValidLookupProperty = 'sub', courseSlug?: string): Promise<IntermediateEnrolment[]> {
    const res = await tx.run<{ enrolment: DatabaseEnrolment }>(`
        MATCH (u:User {\`${property}\`: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course)
        WHERE NOT c.status IN $exclude
        ${courseSlug ? 'AND c.slug = $slug' : ''}
        RETURN e {
            .*,
            courseSlug: c.slug,
            completed: e:CompletedEnrolment,
            failed: (NOT e:CompletedEnrolment AND e:FailedEnrolment) OR (c:Certification AND e.lastSeenAt <= datetime() - duration('P7D')),
            availableAfter: CASE WHEN c:Certification THEN e.lastSeenAt + duration('PT1H') ELSE null END,
            completedModules: [ (e)-[:COMPLETED_MODULE]->(m) | m.link ],
            completedLessons: [ (e)-[:COMPLETED_LESSON]->(l) | l.link ],
            recentlyCompleted: e:CompletedEnrolment AND e.completedAt >= datetime() - duration('P14D'),
            status: CASE
                WHEN e IS NOT NULL AND e:CompletedEnrolment THEN '${STATUS_COMPLETED}'
                WHEN e IS NOT NULL AND e:FailedEnrolment THEN '${STATUS_FAILED}'
                WHEN e IS NOT NULL THEN '${STATUS_ENROLLED}'
                WHEN ((u)-[:INTERESTED_IN]->(c)) THEN '${STATUS_BOOKMARKED}'
                WHEN e.status = $active THEN '${STATUS_AVAILABLE}'
                ELSE 'OTHER'
            END,
            certificateUrl: '/c/'+ e.certificateId +'/'
        }  AS enrolment ORDER BY e.lastSeenAt DESC, e.createdAt DESC

        UNION MATCH (u:User {\`${property}\`: $sub})-[:INTERESTED_IN]->(c)
        ${courseSlug ? 'WHERE c.slug = $slug' : ''}
        RETURN c {
            courseSlug: c.slug,
            completedModules: [],
            completedLessons: [],
            isInterested: true,
            status: '${STATUS_BOOKMARKED}'
        } AS enrolment
    `, appendParams({ active: STATUS_ACTIVE, sub: user[property], slug: courseSlug }))

    if (res.records.length === 0) {
        return []
    }

    return res.records.map(record => {
        const enrolment = record.get('enrolment')

        return {
            ...enrolment,
            createdAt: new Date(enrolment.createdAt),
            completedAt: enrolment.completedAt ? new Date(enrolment.completedAt) : undefined,
            failedAt: enrolment.failedAt ? new Date(enrolment.failedAt) : undefined,
            availableAfter: enrolment.availableAfter ? new Date(enrolment.availableAfter) : undefined,
            lastSeenAt: new Date(enrolment.lastSeenAt),
        }
    })
}
