import { WebClient } from '@slack/web-api'
import { SLACK_CHANNEL, SLACK_TOKEN } from '../../constants'
import { User } from '../../domain/model/user'
import { Reward } from '../../domain/services/rewards/get-rewards'
import { notify } from '../../middleware/bugsnag.middleware'
import { Order, Shipment } from '../printful/types'

let client: WebClient

function getClient(): WebClient {
    if (!client) {
        client = new WebClient(SLACK_TOKEN)
    }

    return client
}

export async function notifyOrderFailed(order: Order, reason: string): Promise<void> {
    if (!SLACK_TOKEN || !SLACK_CHANNEL) {
        return
    }

    const client = getClient()

    try {
        await client.chat.postMessage({
            channel: SLACK_CHANNEL,
            text: `Order ${order.id} has failed: ${reason}`,
            attachments: [
                {
                    fallback: `GraphAcademy Order failed`,
                    pretext: `GraphAcademy Order failed`,
                    color: '#ed1252',
                    fields: [
                        {
                            title: "orderId",
                            value: order.id.toString(),
                            short: false,
                        },
                        {
                            title: "orderUrl",
                            value: order.dashboard_url || `https://printful.com/dashboard?order_id=${order.id}`,
                            short: false,
                        },
                    ]

                }
            ]
        })
    }
    catch (e: any) {
        notify(e)

        throw e
    }
}

export async function notifyOrderCreated(user: User, reward: Reward, order: Order): Promise<void> {
    if (!SLACK_TOKEN || !SLACK_CHANNEL) {
        return
    }

    const client = getClient()

    try {
        await client.chat.postMessage({
            channel: SLACK_CHANNEL,
            text: `Order ${order.id} has been created`,
            attachments: [
                {
                    fallback: `Order created via GraphAcademy`,
                    pretext: `Order created via GraphAcademy`,
                    color: '#018bff',
                    fields: [
                        {
                            title: "userId",
                            value: user.id,
                            short: false,
                        },
                        {
                            title: "reward",
                            value: reward.title,
                            short: false,
                        },
                        {
                            title: "orderId",
                            value: order.id.toString(),
                            short: false,
                        },
                        {
                            title: "orderUrl",
                            value: order.dashboard_url || `https://printful.com/dashboard?order_id=${order.id}`,
                            short: false,
                        },
                    ]

                }
            ]
        })
    }
    catch (e: any) {
        notify(e)

        throw e
    }
}

export async function notifyOrderShipped(order: Order, shipment: Shipment): Promise<void> {
    if (!SLACK_TOKEN || !SLACK_CHANNEL) {
        return
    }

    const client = getClient()

    try {
        await client.chat.postMessage({
            channel: SLACK_CHANNEL,
            text: `Order ${order.id} has shipped:`,
            attachments: [
                {
                    fallback: `GraphAcademy Order Shipped`,
                    pretext: `GraphAcademy Order Shipped`,
                    color: '#00BA88',
                    fields: [
                        {
                            title: "orderId",
                            value: order.id.toString(),
                            short: false,
                        },
                        {
                            title: "orderUrl",
                            value: order.dashboard_url || `https://printful.com/dashboard?order_id=${order.id}`,
                            short: false,
                        },
                        {
                            title: "trackingUrl",
                            value: shipment.tracking_url,
                            short: false,
                        }
                    ]
                }
            ]
        })
    }
    catch (e: any) {
        notify(e)

        throw e
    }
}
