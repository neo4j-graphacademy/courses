import { emitter } from "../../events"
import { OrderCreated } from "../printful/events/OrderCreated"
import { OrderFailed } from "../printful/events/OrderFailed"
import OrderShipped from "../printful/events/OrderShipped"
import { notifyOrderCreated, notifyOrderFailed, notifyOrderShipped } from "./slack.module"

export default function initSlackListeners(): void {
    emitter.on<OrderCreated>(OrderCreated, async ({ user, reward, order }) => {
        await notifyOrderCreated(user, reward, order)
    })

    emitter.on<OrderShipped>(OrderShipped, async ({ order, shipment }) => {
        await notifyOrderShipped(order, shipment)
    })

    emitter.on<OrderFailed>(OrderFailed, async ({ order, reason }) => {
        await notifyOrderFailed(order, reason)
    })

}
