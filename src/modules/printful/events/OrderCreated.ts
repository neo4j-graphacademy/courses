import { User } from "../../../domain/model/user";
import { Order } from "../types";

export class OrderCreated {
    constructor(
        public readonly user: User,
        public readonly order: Order
    ) { }
}
