import { BASE_URL, PRINTFUL_STORE_ID } from "../../constants";
import { AppInit } from "../../domain/events/AppInit";
import { emitter } from "../../events";
import { prepareAndSend } from "../mailer";
import { notifyOrderFailed } from "../slack";
import { OrderCreated } from "./events/OrderCreated";
import { OrderFailed } from "./events/OrderFailed";
import OrderShipped from "./events/OrderShipped";
import { addWebhook } from "./printful.module";
import { ORDER_CREATED, ORDER_UPDATED, PACKAGE_SHIPPED } from "./types";

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

    emitter.on<OrderFailed>(OrderFailed, async ({ order, reason }) => {
        await notifyOrderFailed(order, reason)
    })

    emitter.on<AppInit>(AppInit, async () => {
        if (PRINTFUL_STORE_ID && process.env.NODE_ENV === 'production') {
            await addWebhook(
                PRINTFUL_STORE_ID,
                `${BASE_URL}/api/printful`,
                [
                    ORDER_CREATED,
                    ORDER_UPDATED,
                    PACKAGE_SHIPPED
                ]
            )
        }
    })

}
