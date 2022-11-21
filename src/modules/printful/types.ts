export const ORDER_CREATED = 'order_created'
export const ORDER_UPDATED = 'order_updated'
export const PACKAGE_SHIPPED = 'package_shipped'

export type OrderType = typeof ORDER_CREATED | typeof ORDER_UPDATED | typeof PACKAGE_SHIPPED

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

export interface Order {
    external_id: string,
    shipping: 'STANDARD',
    recipient: Record<string, any>,
    items: Item[]
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
