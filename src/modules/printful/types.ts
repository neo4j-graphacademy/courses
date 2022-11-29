export const ORDER_CREATED = 'order_created'
export const ORDER_UPDATED = 'order_updated'
export const ORDER_FAILED = 'order_failed'
export const PACKAGE_SHIPPED = 'package_shipped'

export type OrderType = typeof ORDER_CREATED | typeof ORDER_UPDATED | typeof PACKAGE_SHIPPED | typeof ORDER_FAILED

interface Recipient {
    name: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state_code: string;
    state_name: string;
    country_code: string;
    country_name: string;
    zip: string;
    phone: string;
    email: string;
    tax_number: string
}

export interface Item {
    id: number;
    external_id: string,
    variant_id: number;
    sync_variant_id: number;
    external_variant_id: string;
    warehouse_product_variant_id: number;
    product_template_id: number;
    external_product_id: string;
    quantity: number;
    price: number;
    retail_price: number;
    name: string;
    product: Record<string, any>;
    files: any[];
    options: any[];
    sku: any;
    discontinued: boolean;
    out_of_stock: boolean;
}

enum OrderStatus {
    draft = "draft", //	The order is created but is not yet submitted for fulfillment. You still can edit it and confirm later.
    pending = "pending", //	The order has been submitted for fulfillment, but is not yet accepted for fulfillment. You can still cancel the order if you need.
    failed = "failed", //	Order was submitted for fulfillment but was returned for review because of an error (problem with address, missing printfiles, charging has failed, etc.).
    canceled = "canceled", //	The order has been canceled and can no longer be processed. If the order was charged then the amount has been returned to your credit card.
    inprocess = "inprocess", //	The order is being fulfilled and can no longer be cancelled or modified. Contact customer support if there are any issues with the order at this point.
    onhold = "onhold", //	The order has encountered a problem during the fulfillment that needs to be resolved together with Printful customer service before fulfillment can continue.
    partial = "partial", //	The order is partially fulfilled (some items are shipped already, the rest will follow)
    fulfilled = "fulfilled", //	All items have been shipped successfully
    archived = "archived", //	The order has been archived and hidden from the UI
}

export interface Order {
    id: number,
    external_id: string,
    status: OrderStatus;
    shipping: 'STANDARD',
    recipient: Recipient,
    items: Item[];
    created: number;
    dashboard_url?: string;
    costs?: {
        currency: string;
        total: string;
    };
    retail_costs: {
        currency: string;
        subtotal: number;
        discount: number;
        shipping: number;
        tax: number;
    };
    gift: {
        subject: string;
        message: string;
    };
}

interface ShipmentItem {
    item_id: number;
    quantity: number;
}

export interface Shipment {
    id: number;
    carrier: string;
    service: string;
    tracking_number: number,
    tracking_url: string,
    created: number; // 1588716060,
    ship_date: string; // 2020-05-05,
    shipped_at: number;
    reshipment: boolean;
    items: ShipmentItem[]
}

interface OrderErrorResponse {
    code: 400 | 401;
    result: string;
    error: {
        reason: string;
        message: string;
    }

}

interface OrderSuccessResponse {
    code: 200;
    result: Order
}

export type OrderResponse = OrderSuccessResponse | OrderErrorResponse