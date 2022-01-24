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
            categories: [ (${course})-[:IN_CATEGORY]->(category) | category { .id, .slug, .title, .description, link: '/categories/'+ category.slug +'/' }],
            ${enrolment !== undefined ? `enrolmentId: ${enrolment}.id, enrolled: ${enrolment} IS NOT NULL, completed: ${enrolment}:CompletedEnrolment, enrolledAt: ${enrolment}.createdAt, completedAt: ${enrolment}.completedAt, lastSeenAt: ${enrolment}.lastSeenAt, ` : ''}
            ${enrolment !== undefined ? `next: [ (${course})-[:FIRST_MODULE]->()-[:NEXT*0..]->(element) WHERE not (${enrolment})-->(element) | element { .title, .link } ][0],` : ''}
            ${enrolment !== undefined ? `completedPercentage: CASE WHEN ${enrolment} IS NOT NULL AND (e)-[:HAS_MODULE]->() THEN toString(toInteger((1.0 * size([ (${enrolment})-[:COMPLETED_LESSON]->(x) WHERE not x:OptionalLesson | x ]) / size([ (${course})-[:HAS_MODULE]->()-[:HAS_LESSON]->(x) WHERE not x:OptionalLesson | x ]))*100)) ELSE 0 END ,` : ''}
            ${enrolment !== undefined ? `sandbox: [ (${enrolment})-[:HAS_SANDBOX]->(sbx) WHERE sbx.expiresAt >= datetime() | sbx { .* } ][0],` : ''}
            ${user !== undefined ? `interested: exists((${course})<-[:INTERESTED_IN]-(${user})),` : ''}
            modules: [ (${course})-[:HAS_MODULE]->(${module}) |
                ${moduleCypher(enrolment, course, module, lesson)}
            ],
            prerequisites: [ (${course})-[:PREREQUISITE]->(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ],
            progressTo: [ (${course})<-[:PREREQUISITE]-(p) WHERE p.status <> 'disabled' | p { .link, .slug, .title, .caption, .thumbnail } ]
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
                    lessons: [ (${module})-[:HAS_LESSON]->(${lesson}) |
                        ${lessonCypher(enrolment, course, module, lesson)}
                    ]
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