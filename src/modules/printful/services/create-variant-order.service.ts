import { int } from "neo4j-driver"
import { User } from "../../../domain/model/user"
import { Reward } from "../../../domain/services/rewards/get-rewards"
import { emitter } from "../../../events"
import { notify } from "../../../middleware/bugsnag.middleware"
import { appendOrderToGoogleSheet } from "../../tshirts-fulfilment"
import { write } from "../../neo4j"
import { OrderCreated } from "../events/OrderCreated"
import { createOrder, getVariant } from "../printful.module"
import Recipient from "../recipient.class"
import { Order } from "../types"

export default async function createVariantOrder(user: User, reward: Reward, storeId: string, recipient: Recipient, variant_id: string, quantity: number): Promise<Order> {
    try {
        const variant = await getVariant(storeId, variant_id)

        let order: Order

        // Append Indian orders to a separate spreadsheet
        if (recipient.country_code === 'IN') {
            order = await appendOrderToGoogleSheet(user, reward, storeId, recipient, variant, quantity)
        }
        else {
            order = await createOrder(storeId, recipient, [{
                ...variant,
                quantity,
            }])
        }

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
                rewardOrderId: typeof order.id === 'string' ? order.id : int(order.id),
                rewardOrderTotalCost: order.costs?.total,
                rewardOrderedAt: order.created,
                rewardStore: storeId,
                rewardProvider: order.provider,
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
