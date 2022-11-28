import { Order, Shipment } from "../types";

export default class OrderShipped {
    constructor(
        public readonly order: Order,
        public readonly shipment: Shipment
    ) { }
}
