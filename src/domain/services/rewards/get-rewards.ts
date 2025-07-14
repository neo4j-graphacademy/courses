import { read } from "../../../modules/neo4j";
import { User } from "../../model/user";

export const STATUS_AVAILABLE = 'available'
export const STATUS_CLAIMED = 'claimed'
export const STATUS_PENDING = 'pending'
export const STATUS_SUSPICIOUS = 'suspicious'

export interface Reward {
    id: string;
    provider: 'printful';
    slug: string;
    type: string;
    link: string;
    title: string;
    description: string;
    image: string;
    status: typeof STATUS_AVAILABLE | typeof STATUS_CLAIMED | typeof STATUS_PENDING | typeof STATUS_SUSPICIOUS;
    trackingUrl?: string;
    redeemedAt: Date;
    productId: string;
    override: boolean | undefined;
}

export default async function getRewards(user: User): Promise<Reward[]> {
    const res = await read(`
        MATCH (c:Course)
        WHERE c.rewardProductId IS NOT NULL

        OPTIONAL MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        WITH u, c, e, [ (u)-[:HAS_ENROLMENT]->(xe:CompletedEnrolment)-[:FOR_COURSE]->(cx) WHERE xe.completedAt <= e.completedAt - duration('P1D') | cx.slug ] AS completedCoursesInPast

        RETURN {
            id: e.id,
            provider: c.rewardProvider,
            slug: c.slug,
            certificateId: e.certificateId,
            type: coalesce(c.rewardType, 'tshirt'),
            link: CASE
                WHEN e.rewardOrderId IS NOT NULL THEN null
                WHEN e:CompletedEnrolment THEN '/account/rewards/' + c.slug +'/'
            ELSE c.link END,
            image: c.rewardImage,
            title: c.title,
            description: 'Claim your free t-shirt for completing the '+ c.title +' '+ CASE WHEN c:Certification THEN 'Certification' ELSE 'Course' END  +'.',
            status: CASE
                WHEN e.rewardOrderId IS NOT NULL THEN 'claimed'
                WHEN e:CompletedEnrolment AND (size(completedCoursesInPast) > 2 OR e.rewardOverride = true) THEN 'available'
                WHEN e:CompletedEnrolment AND size(completedCoursesInPast) <= 2 AND coalesce(e.rewardOverride, false) = false THEN 'suspicious'
            ELSE 'pending' END,
            productId: c.rewardProductId,
            redeemedAt: e.rewardOrderCreatedAt,
            trackingUrl: e.rewardOrderTrackingUrl,
            override: e.rewardOverride
        } AS reward
    `, { sub: user.sub })

    return res.records.map(record => record.get('reward') as Reward)
}
