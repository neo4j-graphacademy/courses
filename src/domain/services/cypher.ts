import { NEGATIVE_STATUSES } from "../model/course"

interface ExtendedParams {
    exclude: typeof NEGATIVE_STATUSES;
    [key: string]: any;
}

export function appendParams(params: Record<string, any>): ExtendedParams {
    params.exclude = NEGATIVE_STATUSES

    return params as ExtendedParams
}

export function courseCypher(enrolment?: string, user?: string, course: string = 'c', module: string = 'm', lesson: string = 'l'): string {
    return `
        ${course} {
            // .slug, .title, .thumbnail, .caption, .status, .usecase, .redirect, .link, .duration, .repository, .video,
            .*,
            certification: ${course}:Certification,
            categories: [ (${course})-[:IN_CATEGORY]->(category) | ${categoryCypher('category')} ],
            ${enrolment !== undefined ? `ref: ${enrolment}.ref,` : ''}
            ${enrolment !== undefined ? `failed: ${enrolment}:FailedEnrolment,` : ''}
            ${enrolment !== undefined ? `enrolmentId: ${enrolment}.id, certificateNumber: ${enrolment}.certificateNumber, enrolled: ${enrolment} IS NOT NULL, completed: ${enrolment}:CompletedEnrolment, enrolledAt: ${enrolment}.createdAt, completedAt: ${enrolment}.completedAt, lastSeenAt: ${enrolment}.lastSeenAt, ` : ''}
            ${enrolment !== undefined ? `next: [ (${course})-[:FIRST_MODULE]->()-[:NEXT*0..]->(element) WHERE not (${enrolment})-->(element) | element { .title, .link } ][0],` : ''}
            ${enrolment !== undefined ? `completedPercentage: CASE WHEN ${enrolment} IS NOT NULL AND size((c)-[:HAS_MODULE|HAS_LESSON*2]->()) > 0 THEN toString(toInteger((1.0 * size([ (${enrolment})-[:COMPLETED_LESSON]->(x) WHERE not x:OptionalLesson | x ]) / size([ (${course})-[:HAS_MODULE]->()-[:HAS_LESSON]->(x) WHERE not x:OptionalLesson | x ]))*100)) ELSE coalesce(${enrolment}.percent, 0) END ,` : ''}
            ${enrolment !== undefined ? `sandbox: [ (${enrolment})-[:HAS_SANDBOX]->(sbx) WHERE sbx.expiresAt >= datetime() | sbx { .* } ][0],` : ''}
            ${user !== undefined ? `isInterested: exists((${course})<-[:INTERESTED_IN]-(${user})),` : ''}
            modules: apoc.coll.sortMaps([ (${course})-[:HAS_MODULE]->(${module}) |
                ${moduleCypher(enrolment, course, module, lesson)}
            ], '^order'),
            prerequisites: [ (${course})<-[:PROGRESS_TO]-(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ],
            progressTo: [ (${course})-[:PROGRESS_TO]->(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ],
            translations: [ (${course})-[:HAS_TRANSLATION]-(translation) | translation { .language, .link, .slug, .title, .caption, .thumbnail } ]
        }
    `
}

export function moduleCypher(enrolment?: string, course: string = 'c', module: string = 'm', lesson: string = 'l'): string {
    return `
                ${module} {
                    .*,
                    .link,
                    next: [ (${module})-[:NEXT]->(next) WHERE NOT next.status IN $exclude |
                        next { .slug, .title, .link }
                    ][0],
                    previous: [ (${module})<-[:NEXT]-(prev) WHERE NOT prev.status IN $exclude |
                        prev { .slug, .title, .link }
                    ][0],
                    ${enrolment !== undefined ? `completed: exists((${enrolment})-[:COMPLETED_MODULE]->(${module})),` : ''}
                    lessons: apoc.coll.sortMaps([ (${module})-[:HAS_LESSON]->(${lesson}) |
                        ${lessonCypher(enrolment, course, module, lesson)}
                    ], '^order')
                }
    `
}

export function lessonCypher(enrolment?: string, course: string = 'c', module: string = 'm', lesson: string = 'l'): string {
    return `
                        ${lesson} {
                            .*,
                            optional: ${lesson}:OptionalLesson,
                            ${enrolment !== undefined ? `completed: exists((${enrolment})-[:COMPLETED_LESSON]->(l)),` : ''}
                            .link,
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

export function categoryCypher(alias: string = 'category', parents: boolean = false) {
    const parentsCypher = parents ? `, parents: [(${alias})<-[:HAS_CHILD]-(p) | p.id ] ` : ''
    return `${alias} { .id, .slug, .title, .description, link: coalesce(${alias}.link, '/categories/'+ ${alias}.slug +'/') ${parentsCypher} }`
}
