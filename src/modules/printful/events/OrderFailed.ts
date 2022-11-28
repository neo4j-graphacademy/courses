import { Order } from "../types";

export class OrderFailed {
    constructor(
        public readonly order: Order,
        public readonly reason: string
    ) { }
}
