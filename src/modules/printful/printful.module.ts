// import axios from "axios"
import { PRINTFUL_API_KEY } from "../../constants"
import { ValidationError } from "../../errors/validation.error"
import Recipient from "./recipient.class"
import { Order, OrderProvider, OrderResponse, Variant } from "./types"

const API_BASE_URL = 'https://api.printful.com'

// Helper function to create fetch options with auth
function createFetchOptions(method: string = 'GET', body?: any, additionalHeaders: Record<string, string> = {}): RequestInit {
    const headers: Record<string, string> = {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        ...additionalHeaders
    }

    if (body) {
        headers['Content-Type'] = 'application/json'
    }

    return {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) })
    }
}

// Helper function to make API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
}

export function getWebhooks<T>(storeId: string) {
    return apiCall<T>('/webhooks', createFetchOptions('GET', undefined, {
        'X-PF-Store-Id': storeId
    }))
}

export function addWebhook(storeId: string, url: string, types: string[]) {
    return apiCall('/webhooks', createFetchOptions('POST', { url, types }, {
        'X-PF-Store-Id': storeId
    }))
}

export function getStores<T = Record<string, any>>() {
    return apiCall<T>('/stores', createFetchOptions())
}

const productCache = new Map<string, any>()
const variantCache = new Map<string, Variant>()

export async function getProduct<T = Record<string, any>>(storeId: string, id: string): Promise<T> {
    const key = storeId + '|' + id
    if (productCache.has(key)) {
        return Promise.resolve(productCache.get(key) as T)
    }

    const data = await apiCall<{ result: T }>(`/store/products/${id}`, createFetchOptions('GET', undefined, {
        'X-PF-Store-Id': storeId,
    }))
    
    return data.result
}

export function getVariant(storeId: string, id: string): Promise<Variant> {
    const key = storeId + '|' + id
    if (variantCache.has(key)) {
        return Promise.resolve(variantCache.get(key) as Variant)
    }

    return apiCall<{ result: Variant }>(`/store/variants/${id}`, createFetchOptions('GET', undefined, {
        'X-PF-Store-Id': storeId,
    })).then(data => data.result)
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
    const data = await apiCall<{ result: Country[] }>('/countries', createFetchOptions())
    const countries = data.result

    return countries.sort((a, b) => a.name < b.name ? -1 : 1)
}

export async function getCountryAndState(countryCode: string, stateCode: string | undefined): Promise<{ country: Country, state: State | undefined }> {
    const data = await apiCall<{ result: Country[] }>('/countries', createFetchOptions())
    const countries = data.result

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
    const data = await apiCall<OrderResponse>('/orders?confirm=true', createFetchOptions('POST', {
        recipient: recipient.toObject(),
        items,
    }, {
        'X-PF-Store-Id': storeId
    }))

    if (data.code === 400 || data.code === 401) {
        throw new ValidationError(data.error.message)
    }

    return Object.assign({}, data.result, {
        provider: OrderProvider.Printful,
    }) as Order
}
