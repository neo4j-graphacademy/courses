import { readTransaction } from "../../modules/neo4j"
import { User } from "../model/user"
import { CourseWithProgress } from "../model/course"
import { Category } from "../model/category"
import { Reward } from "./rewards/get-rewards"
import { appendParams } from "./cypher"

export type DashboardData = {
    enrolments: CourseWithProgress[]
    recentlyCompleted: CourseWithProgress[]
    teams: Array<{
        id: string
        name: string
        courses: Array<{
            slug: string
            title: string
            completedPercentage: number | null
        }>
    }>
    paths: Array<{
        slug: string
        title: string
        link: string
        completedPercentage: number
        courses: Array<{
            slug: string
            title: string
            link: string
            completedPercentage: number | null
        }>
    }>
    certifications: Array<{
        link: string
        title: string
        slug: string
        completed: boolean
        completedAt?: Date
        rewardOrderId?: string
        rewardOrderCreatedAt?: Date
    }>
    rewards: Array<{
        link: string
        title: string
        slug: string
        completed: boolean
        completedAt?: Date
        rewardOrderId: string
        rewardOrderCreatedAt: Date
        rewardProductId: string
        rewardOrderForm: string
        rewardImage: string
    }>
}

export async function getDashboardData(user: User): Promise<DashboardData> {
    return readTransaction(async tx => {
        const res = await tx.run(`
            MATCH (u:User {sub: $sub})

            // get all enrolments
            CALL (u) {
                OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
                WITH u, e, c ORDER BY e.lastSeenAt DESC, e.createdAt DESC
                RETURN collect(c {
                    .title, .slug, .caption, .link,
                    enrolled: true,
                    certificateId: e.certificateId,
                    certificateUrl: '/c/' + e.certificateId,
                    lastSeenAt: e.lastSeenAt, createdAt: e.createdAt, completedAt: e.completedAt,
                    rewardOrderId: e.rewardOrderId,
                    rewardOrderCreatedAt: e.rewardOrderCreatedAt,
                    completed: e:CompletedEnrolment,
                    completedLessons: COUNT { (e)-[:COMPLETED_LESSON]->(l WHERE NOT l:OptionalLesson) },
                    mandatoryLessons: COUNT { (c)-[:HAS_MODULE|HAS_LESSON*2]->(l WHERE NOT l:OptionalLesson) },
                    completedPercentage: CASE 
                        WHEN e:CompletedEnrolment THEN 100.0  
                        WHEN COUNT { (c)-[:HAS_MODULE|HAS_LESSON*2]->(l WHERE NOT l:OptionalLesson) } > 0 
                            THEN 100.0 * COUNT { (e)-[:COMPLETED_LESSON]->(l WHERE NOT l:OptionalLesson) } / COUNT { (c)-[:HAS_MODULE|HAS_LESSON*2]->(l WHERE NOT l:OptionalLesson) }
                        ELSE null END 
                }) AS enrolments
            }

            // get teams with their paths
            CALL (u, enrolments) {
                OPTIONAL MATCH (u)-[r:MEMBER_OF]->(t)
                WITH u, r, t ORDER BY r.createdAt DESC
                OPTIONAL MATCH (c)-[lr:ON_LEARNING_PATH_FOR]->(t)

                WITH u, r, t, c, lr.order AS order
                ORDER BY r.createdAt DESC, order ASC

                WITH u, t, collect(c { .slug, .title, order: order}) AS courses
                ORDER BY size(courses) DESC

                RETURN collect(t {
                    .id, .name, 
                    courses: [ 
                        c IN courses | c { .slug, .title, 
                        completedPercentage: [ e IN enrolments WHERE e.slug = c.slug | e.completedPercentage ][0],
                        lastSeenAt: [ e IN enrolments WHERE e.slug = c.slug | e.lastSeenAt ][0],
                        completedAt: [ e IN enrolments WHERE e.slug = c.slug | e.completedAt ][0]
                    }] } ) AS teams
            }

            // get learning paths that the user has implicit interest in
            CALL (u, enrolments) {
                MATCH (u)-[:HAS_ENROLMENT]->(e)-[:THROUGH_CATEGORY]->(p)<-[r:IN_CATEGORY]-(c)
                WITH enrolments, p, c
                ORDER BY r.order ASC

                WITH p, collect(distinct c {
                    .slug, .title, .link,
                    completedPercentage: [ e IN enrolments WHERE e.slug = c.slug | e.completedPercentage ][0],
                    lastSeenAt: [ e IN enrolments WHERE e.slug = c.slug | e.lastSeenAt ][0],
                    completedAt: [ e IN enrolments WHERE e.slug = c.slug | e.completedAt ][0]
                }) AS courses
                RETURN collect(p {
                    .slug, 
                    .title,
                    .link,
                    courses: courses
                }) AS paths
            }

            // recently completed
            CALL (u, enrolments) {
                UNWIND enrolments AS e
                WITH e 
                WHERE e.completed = true AND e.completedAt >= datetime() - duration('P2W')
                WITH e
                ORDER BY e.completedAt DESC
                RETURN collect(e) AS recentlyCompleted
            }

            // certifications
            CALL (u, enrolments) {
                MATCH (c:Certification)
                OPTIONAL MATCH (c)-[r:HAS_PREREQUISITE]->(x)
                WITH c, r, x ORDER BY r.order ASC
                WITH c,
                    collect(x { 
                        .slug, .title, .link
                    }) AS prerequisites,
                    [ e IN enrolments WHERE e.slug = c.slug | e ][0] AS enrolment
                RETURN collect(c {
                    .link, .title, .slug, .rewardProductId, .rewardImage, .rewardOrderForm,
                    completed: enrolment.completed,
                    completedAt: enrolment.completedAt,
                    prerequisites: [ p in prerequisites | p { 
                        .*, 
                        enrolled: size([ e IN enrolments WHERE e.slug = p.slug | e.completed ]) > 0,
                        certificateUrl: [ e IN enrolments WHERE e.slug = p.slug | e.certificateUrl ][0],
                        completed: [ e IN enrolments WHERE e.slug = p.slug | e.completed ][0],
                        lastSeenAt: [ e IN enrolments WHERE e.slug = p.slug | e.lastSeenAt ][0],
                        completedAt: [ e IN enrolments WHERE e.slug = p.slug | e.completedAt ][0],
                        completedPercentage: [ e IN enrolments WHERE e.slug = p.slug | e.completedPercentage ][0] 
                    } ]
                }) as certifications
            }

            // Rewards
            // TODO: All rewards, not hardcoded certification
            CALL (u, enrolments) {
                MATCH (c:Course {slug: 'neo4j-certification'})
                WITH c, [ e IN enrolments WHERE e.slug = c.slug | e ][0] AS enrolment
                RETURN collect(c {
                    .link, .title, .slug, .rewardProductId, .rewardOrderForm, 
                    .rewardImage,
                    completed: enrolment.completed,
                    completedAt: enrolment.completedAt,
                    rewardOrderId: enrolment.rewardOrderId,
                    rewardOrderCreatedAt: enrolment.rewardOrderCreatedAt
                }) as rewards
            }

            RETURN 
                [e in enrolments WHERE e.link STARTS WITH '/courses' AND e.completed = false | e] AS enrolments, 
                recentlyCompleted, teams, paths, certifications, rewards
        `, appendParams({ sub: user.sub }))

        const record = res.records[0]
        if (!record) {
            throw new Error('User not found')
        }

        return {
            enrolments: record.get('enrolments'),
            recentlyCompleted: record.get('recentlyCompleted'),
            teams: record.get('teams'),
            paths: record.get('paths'),
            certifications: record.get('certifications'),
            rewards: record.get('rewards'),
        }
    })
} 