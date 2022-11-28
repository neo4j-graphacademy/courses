import { int } from "neo4j-driver"
import { User } from "../../../domain/model/user"
import { Reward } from "../../../domain/services/rewards/get-rewards"
import { emitter } from "../../../events"
import { notify } from "../../../middleware/bugsnag.middleware"
import { write } from "../../neo4j"
import { OrderCreated } from "../events/OrderCreated"
import { createOrder } from "../printful.module"
import Recipient from "../recipient.class"
import { Order } from "../types"

export default async function createVariantOrder(user: User, reward: Reward, storeId: string, recipient: Recipient, variant_id: string, quantity: number): Promise<Order> {
    try {
        const order = await createOrder(storeId, recipient, [{ variant_id, quantity }])

        // Update Database
        await write(`
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $slug})

        SET e:RewardOrdered,
            e.rewardOrderCreatedAt = datetime(),
            e.rewardOrderedAt = datetime(),
            e+= $order

    `, {
            sub: user.sub, slug: reward.slug,
            order: {
                rewardOrderId: int(order.id),
                rewardOrderTotalCost: order.costs?.total,
                rewardOrderedAt: order.created,
                rewardStore: storeId,
            }
        })

        // Emit event
        emitter.emit(new OrderCreated(
            user,
            reward,
            order,
        ))

        return order
    }
    catch (e: any) {
        notify(e, event => {
            event.setUser(user.id, user.email, user.name)
            event.addMetadata('reward', reward)
            event.addMetadata('order', {
                id: storeId,
                variant_id,
                quantity,
                reason: e.response?.data?.reason,
            })
            event.addMetadata('recipient', recipient.toObject())
        })

        throw e
    }
}
