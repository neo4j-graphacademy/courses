import { int } from "neo4j-driver";
import { write } from "../../neo4j";
import { Order } from "../types";

export default async function markTshirtOrderCreated(order: Order): Promise<void> {
    await write(`
        MATCH (e:Enrolment {tshirtOrderId: $id})
        SET e.rewardOrderUpdatedAt = datetime(),
            e.rewardOrderStatus = $status
    `, { id: int(order.id), status: order.status })
}
