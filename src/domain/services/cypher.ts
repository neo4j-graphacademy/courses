export function courseCypher(enrolment?: string, course: string = 'c', module: string = 'm', lesson: string = 'l'): string {
    return `
        ${course} {
            .slug,
            .title,
            .thumbnail,
            .caption,
            .status,
            .usecase,
            .link,
            ${enrolment !== undefined ? `enrolled: ${enrolment} IS NOT NULL, completed: ${enrolment}:CompletedEnrolment, completedAt: ${enrolment}.completedAt,` : ''}
            ${enrolment !== undefined ? `next: [ (${course})-[:FIRST_MODULE]->()-[:NEXT*0..]->(element) WHERE not (${enrolment})-->(element) | element { .title, .link } ][0],` : ''}
            modules: [ (${course})-[:HAS_MODULE]->(${module}) |
                ${moduleCypher(enrolment, course, module, lesson)}
            ]
        }
    `
}

export function moduleCypher(enrolment?: string, course: string = 'c', module: string = 'm', lesson: string = 'l'): string {
    return `
                ${module} {
                    .*,
                    .link,
                    next: [ (${module})-[:NEXT]->(next) |
                        next { .slug, .title, .link }
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
                            ${enrolment !== undefined ? `completed: exists((${enrolment})-[:COMPLETED_LESSON]->(l)),` : ''}
                            .link,
                            next: [ (${lesson})-[:NEXT]->(next) |
                                next { .slug, .title, .link }
                            ][0],
                            questions: [ (${lesson})-[:HAS_QUESTION]->(q) | q {
                                    .id,
                                    .slug
                                }
                            ]
                        }
    `
}