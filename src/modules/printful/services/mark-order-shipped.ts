import { int } from "neo4j-driver";
import { emitter } from "../../../events";
import { write } from "../../neo4j";
import OrderShipped from "../events/OrderShipped";
import { Order, Shipment } from "../types";

export default async function markPackageShipped(order: Order, shipment: Shipment): Promise<void> {
    // Update database
    await write(`
        MATCH (e:Enrolment {rewardOrderId: $id})
        SET e.rewardOrderUpdatedAt = datetime(),
            e.rewardOrderStatus = coalesce($status, e.rewardOrderStatus),
            e.rewardShippedAt = [$shipment.ship_date, $shipment.shipped_at],
            e.rewardTrackingNumber = $shipment.tracking_number,
            e.rewardTrackingUrl = $shipment.tracking_url
    `, { id: int(order.id), status: order.status, shipment })

    // Fire event
    emitter.emit(new OrderShipped(order, shipment))
}
