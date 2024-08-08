import { NEGATIVE_STATUSES } from "../model/course"

interface ExtendedParams {
    exclude: typeof NEGATIVE_STATUSES;
    [key: string]: any;
}

export function appendParams(params: Record<string, any>): ExtendedParams {
    params.exclude = NEGATIVE_STATUSES

    return params as ExtendedParams
}

export function courseCypher(enrolment?: string, user?: string, course = 'c', module = 'm', lesson = 'l'): string {
    return `
        ${course} {
            .*,
            certification: ${course}:Certification,
            categories: [ (${course})-[:IN_CATEGORY]->(category) | ${categoryCypher('category')} ],
            ${enrolment !== undefined ? `ref: ${enrolment}.ref,` : ''}
            ${enrolment !== undefined ? `failed: ${enrolment}:FailedEnrolment OR (${course}:Certification AND ${enrolment}.lastSeenAt <= datetime() - duration('PT1H30M')), availableAfter: toString(e.failedAt + duration('PT24H')),` : ''}
            ${enrolment !== undefined ? `enrolmentId: ${enrolment}.id, certificateId: ${enrolment}.certificateId, certificateNumber: ${enrolment}.certificateNumber, enrolled: ${enrolment} IS NOT NULL, certificateUrl: '/c/'+ ${enrolment}.certificateId +'/', completed: ${enrolment}:CompletedEnrolment, enrolledAt: ${enrolment}.createdAt, completedAt: ${enrolment}.completedAt, lastSeenAt: ${enrolment}.lastSeenAt, ` : ''}
            ${enrolment !== undefined ? `next: [ (${course})-[:FIRST_MODULE]->()-[:NEXT*0..]->(element) WHERE not (${enrolment})-->(element) | element { .title, .link } ][0],` : ''}
            ${enrolment !== undefined ? `completedPercentage: CASE
                WHEN ${enrolment} IS NOT NULL AND ${enrolment}:CompletedEnrolent THEN 100
                WHEN ${enrolment} IS NOT NULL AND size([ (c)-[:HAS_MODULE|HAS_LESSON*2]->(l) | l ])  > 0
                    THEN
                        toString(
                            toInteger(
                                (1.0 *
                                    size ( [ (${enrolment})-[:COMPLETED_LESSON]->(x) WHERE not x:OptionalLesson | x ] )
                                    / size ( [ (${course})-[:HAS_MODULE]->()-[:HAS_LESSON]->(x) WHERE not x:OptionalLesson | x ] )
                                )
                            *100)
                        )
                ELSE coalesce(${enrolment}.percentage, 0) END ,` : ''}
            ${enrolment !== undefined ? `sandbox: [ (${enrolment})-[:HAS_SANDBOX]->(sbx) | sbx { .* } ][0],` : ''}
            ${user !== undefined ? `isInterested: exists((${course})<-[:INTERESTED_IN]-(${user})),` : ''}
            modules: apoc.coll.sortMaps([ (${course})-[:HAS_MODULE]->(${module}) |
                ${moduleCypher(enrolment, module, lesson)}
            ], '^order'),
            prerequisites: [ (${course})<-[:PROGRESS_TO]-(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ],
            progressTo: [ (${course})-[:PROGRESS_TO]->(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ],
            translations: [ (${course})-[:HAS_TRANSLATION]-(translation) | translation { .language, .link, .slug, .title, .caption, .thumbnail } ]
        }
    `
}

export function moduleCypher(enrolment?: string, module = 'm', lesson = 'l'): string {
    return `
                ${module} {
                    .*,
                    next: [ (${module})-[:NEXT]->(next) WHERE NOT next.status IN $exclude |
                        next { .slug, .title, .link }
                    ][0],
                    previous: [ (${module})<-[:NEXT]-(prev) WHERE NOT prev.status IN $exclude |
                        prev { .slug, .title, .link }
                    ][0],
                    ${enrolment !== undefined ? `completed: exists((${enrolment})-[:COMPLETED_MODULE]->(${module})),` : ''}
                    lessons: apoc.coll.sortMaps([ (${module})-[:HAS_LESSON]->(${lesson}) |
                        ${lessonCypher(enrolment, lesson)}
                    ], '^order')
                }
    `
}

export function lessonCypher(enrolment?: string, lesson = 'l'): string {
    return `
                        ${lesson} {
                            .*,
                            optional: ${lesson}:OptionalLesson,
                            ${enrolment !== undefined ? `completed: exists((${enrolment})-[:COMPLETED_LESSON]->(l)),` : ''}
                            next: [ (${lesson})-[:NEXT]->(next) |
                                next { .slug, .title, .link }
                            ][0],
                            previous: [ (${lesson})<-[:NEXT]-(prev) |
                                prev { .slug, .title, .link }
                            ][0],
                            questions: [ (${lesson})-[:HAS_QUESTION]->(q) | q {
                                    .id,
                                    .slug
                                }
                            ]
                        }
    `
}

export function categoryCypher(alias = 'category', parents = false) {
    const parentsCypher = parents ? `, parents: [(${alias})<-[pr:HAS_CHILD]-(p) | { id: p.id, order: pr.order } ] ` : ''
    return `${alias} { .id, .slug, .title, .description, .shortName, .caption, link: coalesce(${alias}.link, '/categories/'+ ${alias}.slug +'/') ${parentsCypher} }`
}
