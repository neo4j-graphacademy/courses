import { int } from "neo4j-driver";
import { emitter } from "../../../events";
import { write } from "../../neo4j";
import { OrderFailed } from "../events/OrderFailed";
import { Order } from "../types";

export default async function markOrderFailed(order: Order, reason: string): Promise<void> {
    await write(`
        MATCH (e:Enrolment {tshirtOrderId: $id})
        SET e.rewardOrderFailedAt = datetime(),
            e.rewardFailureReason = $reason,
            e.rewardOrderStatus = coalesce($status, e.rewardOrderStatus)
    `, { id: int(order.id), status: order.status, reason })

    emitter.emit(new OrderFailed(
        order,
        reason,
    ))
}
