import { read } from "../../../modules/neo4j";
import { User } from "../../model/user";

export const STATUS_AVAILABLE = 'available'
export const STATUS_CLAIMED = 'claimed'
export const STATUS_PENDING = 'pending'

export interface Reward {
    provider: 'printful';
    slug: string;
    type: string;
    link: string;
    title: string;
    description: string;
    image: string;
    status: typeof STATUS_AVAILABLE | typeof STATUS_CLAIMED | typeof STATUS_PENDING;
    trackingUrl?: string;
    redeemedAt: Date;
    productId: string;
}

export default async function getRewards(user: User): Promise<Reward[]> {
    // Certified Professional T-shirts
    const res = await read(`
        MATCH (c:Course)
        WHERE c.rewardProductId IS NOT NULL

        OPTIONAL MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        RETURN {
            provider: c.rewardProvider,
            slug: c.slug,
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
                WHEN e:CompletedEnrolment THEN 'available'
            ELSE 'pending' END,
            productId: c.rewardProductId,
            redeemedAt: e.rewardOrderCreatedAt,
            trackingUrl: e.rewardOrderTrackingUrl
        } AS reward
    `, { sub: user.sub })

    return res.records.map(record => record.get('reward') as Reward)
}
