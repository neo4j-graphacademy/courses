import { WebClient } from '@slack/web-api'
import { SLACK_CHANNEL, SLACK_TOKEN } from '../constants'
import { notify } from '../middleware/bugsnag.middleware'
import { Order } from './printful/types'

let client: WebClient

export async function notifyOrderFailed(order: Order, reason: string): Promise<void> {
    if (!SLACK_TOKEN || !SLACK_CHANNEL) {
        return
    }

    if (!client) {
        client = new WebClient(SLACK_TOKEN)
    }

    try {
        await client.chat.postMessage({
            channel: SLACK_CHANNEL,
            text: `Order ${order.id} has failed: ${reason}`,
            attachments: [
                {
                    fallback: `PROSHIRTS ORDER FAILED`,
                    pretext: `PROSHIRTS ORDER FAILED`,
                    color: '#cc254b',
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
