import axios from "axios"
import { PRINTFUL_API_KEY } from "../../constants"
import { ValidationError } from "../../errors/validation.error"
import Recipient from "./recipient.class"
import { Order, OrderResponse, Variant } from "./types"

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

const productCache = new Map<string, any>()
const variantCache = new Map<string, Variant>()

export function getProduct<T>(storeId: string, id: string): Promise<T> {
    const key = storeId + '|' + id
    if (productCache.has(key)) {
        return Promise.resolve(productCache.get(key) as T)
    }

    return api.get(`/store/products/${id}`, {
        headers: {
            'X-PF-Store-Id': storeId,
        }
    })
        .then(res => res.data.result as T)
}

export function getVariant(storeId: string, id: string): Promise<Variant> {
    const key = storeId + '|' + id
    if (variantCache.has(key)) {
        return Promise.resolve(variantCache.get(key) as Variant)
    }

    return api.get(`/store/variants/${id}`, {
        headers: {
            'X-PF-Store-Id': storeId,
        }
    })
        .then(res => res.data.result as Variant)
}

interface State {
    code: string;
    name: string;
}

export interface Country {
    code: string;
    name: string;
    states: State[]
}

export async function getCountries(): Promise<Country[]> {
    const countries = await api.get<{ result: Country[] }>('/countries')
        .then(res => res.data.result)


    return countries.sort((a, b) => a.name < b.name ? -1 : 1)
}

export async function getCountryAndState(countryCode: string, stateCode: string | undefined): Promise<{ country: Country, state: State | undefined }> {
    const countries = await api.get<{ result: Country[] }>('/countries')
        .then(res => res.data.result)

    const country = countries.find(row => row.code === countryCode)

    if (!country) {
        throw new ValidationError(
            `"${countryCode}" is an invalid Country`,
            { country: `"${countryCode}" is an invalid Country` }
        )
    }

    let state: State | undefined = undefined

    if (country && country.states) {
        state = country.states.find(state => state.code === stateCode)
    }

    return { state, country }
}

export function formatRecipient(
    name: string,
    address1: string,
    address2: string | undefined,
    city: string,
    state_code: string | undefined,
    state_name: string | undefined,
    country_code: string,
    country_name: string,
    zip: string,
    phone: string,
    email: string,
    company?: string,
    tax_number?: string
): Recipient {
    const recipient = new Recipient(
        name,
        address1,
        address2,
        city,
        state_code,
        state_name,
        country_code,
        country_name,
        zip,
        email,
        phone,
        company,
        tax_number
    )

    const { valid, errors } = recipient.validate()

    if (!valid) {
        throw new ValidationError(
            `Unable to validate address`,
            errors,
        )
    }

    return recipient
}


type OrderItem = Partial<Variant> & { quantity: number }


export async function createOrder(storeId: string, recipient: Recipient, items: OrderItem[]): Promise<Order> {
    const res = await api.post<OrderResponse>('/orders?confirm=true', {
        recipient: recipient.toObject(),
        items,
    },
        {
            headers: {
                'Content-type': 'application/json',
                'X-PF-Store-Id': storeId
            }
        })

    if (res.data.code === 400 || res.data.code === 401) {
        throw new ValidationError(res.data.error.message)
    }

    return res.data.result as Order
}
