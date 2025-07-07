import { 
    getStores, 
    getWebhooks, 
    addWebhook, 
    getProduct, 
    getVariant, 
    getCountries, 
    getCountryAndState, 
    formatRecipient, 
    createOrder 
} from './printful.module'
import Recipient from './recipient.class'
import { Order, OrderProvider, Variant } from './types'
import { PRINTFUL_STORE_ID } from '../../constants'

describe('Printful Integration Tests', () => {
    let storeId: string
    let testProductId: string
    let testVariationId: number
    let testRecipient: Recipient
    let testVariant: Variant

    beforeAll(() => {
        // Get test values from environment variables
        storeId = PRINTFUL_STORE_ID || process.env.PRINTFUL_STORE_ID!
        testProductId = process.env.PRINTFUL_TEST_PRODUCT_ID!
        testVariationId = parseInt(process.env.PRINTFUL_TEST_VARIATION_ID!)

        // Validate required environment variables
        expect(storeId).toBeDefined()
        expect(testProductId).toBeDefined()
        expect(testVariationId).toBeDefined()
        expect(process.env.PRINTFUL_API_KEY).toBeDefined()

        // Create test recipient from environment variables
        testRecipient = formatRecipient(
            process.env.PRINTFUL_TEST_ORDER_NAME!,
            process.env.PRINTFUL_TEST_ORDER_ADDRESS1!,
            process.env.PRINTFUL_TEST_ORDER_ADDRESS2 || undefined,
            process.env.PRINTFUL_TEST_ORDER_CITY!,
            process.env.PRINTFUL_TEST_ORDER_STATE_CODE || undefined,
            process.env.PRINTFUL_TEST_ORDER_STATE_NAME || undefined,
            process.env.PRINTFUL_TEST_ORDER_COUNTRY_CODE!,
            process.env.PRINTFUL_TEST_ORDER_COUNTRY_NAME!,
            process.env.PRINTFUL_TEST_ORDER_ZIP!,
            process.env.PRINTFUL_TEST_ORDER_PHONE!,
            process.env.PRINTFUL_TEST_ORDER_EMAIL!,
            process.env.PRINTFUL_TEST_ORDER_COMPANY || undefined,
            process.env.PRINTFUL_TEST_ORDER_TAX_NUMBER || undefined
        )
    })

    describe('Store Management', () => {
        it('should get list of stores', async () => {
            const stores = await getStores()

            expect(stores).toBeDefined()
            expect(Array.isArray(stores.result)).toBe(true)
            expect(stores.result.map(store => store.id).map(id => id.toString())).toContain(storeId)
        }, 30000)
    })

    describe('Product Management', () => {
        it('should get product information', async () => {
            const product = await getProduct(storeId, testProductId)

            expect(product).toBeDefined()
            expect(product.sync_product).toBeDefined()
            expect(product.sync_product.id).toBeDefined()
            expect(product.sync_product.name).toBeDefined()
        }, 30000)

        it('should get variant information', async () => {
            testVariant = await getVariant(storeId, testVariationId.toString())

            expect(testVariant).toBeDefined()
            expect(testVariant.id).toBe(testVariationId)
        }, 30000)
    })

    describe('Location Management', () => {
        it('should get list of countries', async () => {
            const countries = await getCountries()
            
            expect(countries).toBeDefined()
            expect(Array.isArray(countries)).toBe(true)
            expect(countries.length).toBeGreaterThan(0)
            
            // Should be sorted alphabetically
            const countryNames = countries.map(c => c.name)
            const sortedNames = [...countryNames].sort()
            expect(countryNames).toEqual(sortedNames)
            
            // Should contain expected countries
            const usCounts = countries.find(c => c.code === 'US')
            const ukCounts = countries.find(c => c.code === 'GB')
            expect(usCounts).toBeDefined()
            expect(ukCounts).toBeDefined()
        }, 30000)

        it('should get country and state information', async () => {
            const { country, state } = await getCountryAndState('US', 'CA')
            
            expect(country).toBeDefined()
            expect(country.code).toBe('US')
            expect(country.name).toBe('United States')
            expect(country.states).toBeDefined()
            
            expect(state).toBeDefined()
            expect(state!.code).toBe('CA')
            expect(state!.name).toBe('California')
        }, 30000)

        it('should handle country without state', async () => {
            const { country, state } = await getCountryAndState('GB', undefined)
            
            expect(country).toBeDefined()
            expect(country.code).toBe('GB')
            expect(state).toBeUndefined()
        }, 30000)

        it('should throw error for invalid country code', async () => {
            await expect(getCountryAndState('INVALID', undefined))
                .rejects
                .toThrow('"INVALID" is an invalid Country')
        }, 30000)
    })

    describe('Recipient Management', () => {
        it('should format recipient correctly', () => {
            expect(testRecipient).toBeDefined()
            expect(testRecipient.name).toBe(process.env.PRINTFUL_TEST_ORDER_NAME)
            expect(testRecipient.address1).toBe(process.env.PRINTFUL_TEST_ORDER_ADDRESS1)
            expect(testRecipient.city).toBe(process.env.PRINTFUL_TEST_ORDER_CITY)
            expect(testRecipient.country_code).toBe(process.env.PRINTFUL_TEST_ORDER_COUNTRY_CODE)
            expect(testRecipient.email).toBe(process.env.PRINTFUL_TEST_ORDER_EMAIL)
        })

        it('should validate recipient successfully', () => {
            const { valid, errors } = testRecipient.validate()
            
            expect(valid).toBe(true)
            expect(Object.keys(errors)).toHaveLength(0)
        })

        it('should throw validation error for invalid recipient', () => {
            expect(() => {
                formatRecipient(
                    '', // Invalid empty name
                    process.env.PRINTFUL_TEST_ORDER_ADDRESS1!,
                    undefined,
                    process.env.PRINTFUL_TEST_ORDER_CITY!,
                    undefined,
                    undefined,
                    process.env.PRINTFUL_TEST_ORDER_COUNTRY_CODE!,
                    process.env.PRINTFUL_TEST_ORDER_COUNTRY_NAME!,
                    process.env.PRINTFUL_TEST_ORDER_ZIP!,
                    process.env.PRINTFUL_TEST_ORDER_PHONE!,
                    process.env.PRINTFUL_TEST_ORDER_EMAIL!
                )
            }).toThrow('Unable to validate address')
        })
    })

    describe('Order Management', () => {
        let createdOrder: Order

        it('should create an order successfully', async () => {
            const variant = await getVariant(storeId, testVariationId.toString())

            const orderItems = [{
                ...variant,
                quantity: 1
            }]

            createdOrder = await createOrder(storeId, testRecipient, orderItems)
            
            expect(createdOrder).toBeDefined()
            expect(createdOrder.provider).toBe(OrderProvider.Printful)
            expect(createdOrder.id).toBeDefined()
            expect(createdOrder.external_id).toBeDefined()
            expect(createdOrder.status).toBeDefined()
            expect(createdOrder.recipient).toBeDefined()
            expect(createdOrder.items).toBeDefined()
            expect(createdOrder.items.length).toBe(1)
            expect(createdOrder.items[0].quantity).toBe(1)
            expect(createdOrder.created).toBeDefined()
            expect(typeof createdOrder.created).toBe('number')

            // Recipient should match our test recipient
            expect(createdOrder.recipient.name).toBe(testRecipient.name)
            expect(createdOrder.recipient.email).toBe(testRecipient.email)
            expect(createdOrder.recipient.address1).toBe(testRecipient.address1)
            expect(createdOrder.recipient.city).toBe(testRecipient.city)
            expect(createdOrder.recipient.country_code).toBe(testRecipient.country_code)

            console.log('Created order:', {
                id: createdOrder.id,
                external_id: createdOrder.external_id,
                status: createdOrder.status,
                // dashboard_url: createdOrder.dashboard_url
            })
        }, 60000)
    })
}) 
