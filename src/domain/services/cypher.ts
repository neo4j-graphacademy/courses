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
            ${enrolment ? `enrolled: ${enrolment} IS NOT NULL, completed: ${enrolment}:CompletedEnrolment,` : ''}
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
                    ${enrolment ? `completed: exists((${enrolment})-[:COMPLETED_MODULE]->(${module})),` : ''}
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
                            ${enrolment ? `completed: exists((${enrolment})-[:COMPLETED_LESSON]->(l)),` : ''}
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