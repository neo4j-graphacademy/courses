import axios from "axios"
import { PRINTFUL_API_KEY } from "../../constants"

const API_BASE_URL = 'https://api.printful.com'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        authorization: `Bearer ${PRINTFUL_API_KEY}`
    }
})


export function getWebhooks<T>(storeId: string) {
    return api.get('/webhooks', {
        headers: {
            'X-PF-Store-Id': storeId
        }
    })
        .then(res => res.data as T)
}

export function addWebhook(storeId: string, url: string, types: string[]) {
    return api.post(
        '/webhooks',
        { url, types },
        {
            headers: {
                'Content-type': 'application/json',
                'X-PF-Store-Id': storeId
            }
        }
    )
}

export function getStores<T>() {
    return api.get('/stores')
        .then(res => res.data as T)
}
