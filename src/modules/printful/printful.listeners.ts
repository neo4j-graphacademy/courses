import { emitter } from "../../events";
import { prepareAndSend } from "../mailer";
import { OrderCreated } from "./events/OrderCreated";
import OrderShipped from "./events/OrderShipped";

export default function initPrintfulListeners(): void {

    emitter.on<OrderCreated>(OrderCreated, ({ order }) => {
        if (order.recipient.email) {
            prepareAndSend('reward-ordered', order.recipient.email, {
                order,
            })
        }
    })

    emitter.on<OrderShipped>(OrderShipped, ({ order, shipment }) => {
        if (order.recipient.email) {
            prepareAndSend('reward-shipped', order.recipient.email, {
                order,
                shipment,
            })
        }
    })

}
