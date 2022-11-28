import axios, { AxiosInstance } from 'axios'
import { SLACK_SERVICE_URL } from '../constants'
import { notify } from '../middleware/bugsnag.middleware'
import { Order } from './printful/types'

let api: AxiosInstance

export async function notifyOrderFailed(order: Order, reason: string): Promise<void> {
    if (!SLACK_SERVICE_URL) {
        return
    }

    if (!api) {
        api = axios.create({
            baseURL: SLACK_SERVICE_URL,
        })
    }

    const message = {
        "text": "An order has failed",
        "attachments": [
            {
                "fallback": "PROSHIRT ORDER FAILED",
                "text": `An order has failed" ${reason}`,
                "pretext": "PROSHIRT ORDER FAILED",

                "color": "#FF0000",

                "fields": [
                    {
                        "title": "orderUrl",
                        "value": order.dashboard_url,
                        "short": false
                    },
                    {
                        "title": "OrderId",
                        "value": order.id,
                        "short": false
                    },

                ]
            }
        ]
    }

    try {
        await api.post('/', message)
    }
    catch (e: any) {
        notify(e)
    }
}
