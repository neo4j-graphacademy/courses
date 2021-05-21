export function courseCypher(enrolment?: string, course: string = 'c', module: string = 'm', lesson: string = 'l'): string {
    return `
        ${course} {
            .slug,
            .title,
            .thumbnail,
            .caption,
            .status,
            .usecase,
            link: '/courses/'+ c.slug,
            ${enrolment ? `enrolled: ${enrolment} IS NOT NULL, completed: ${enrolment}:CompletedEnrolment,` : ''}
            modules: [ (c)-[:HAS_MODULE]->(m) |
                ${moduleCypher(enrolment, course, module, lesson)}
            ]
        }
    `
}

export function moduleCypher(enrolment?: string, course: string = 'c', module: string = 'm', lesson: string = 'l'): string {
    return `
                ${module} {
                    .*,
                    link: '/courses/'+ c.slug +'/'+ m.slug,
                    next: [ (m)-[:FIRST_LESSON]->(next) |
                        next { .slug, .title, link: '/courses/'+ c.slug + '/'+ m.slug +'/'+ next.slug }
                    ][0],
                    ${enrolment ? `completed: exists((${enrolment})-[:COMPLETED_MODULE]->(${module})),` : ''}
                    lessons: [ (m)-[:HAS_LESSON]->(l) |
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
                            link: '/courses/'+ ${course}.slug +'/'+ ${module}.slug +'/'+ ${lesson}.slug,
                            next: [ (${lesson})-[:NEXT_LESSON]->(next)<-[:HAS_LESSON]-(nm) | next {
                                    .slug,
                                    .title,
                                    link: '/courses/'+ c.slug + '/'+ nm.slug +'/'+ next.slug
                                }
                            ][0],
                            questions: [ (${lesson})-[:HAS_QUESTION]->(q) | q {
                                    .id,
                                    .slug
                                }
                            ]
                        }
    `
}