import { User } from "../../../domain/model/user";
import { Order, Shipment } from "../types";

export class PackageShipped {
    constructor(
        public readonly user: User,
        public readonly order: Order,
        public readonly shipment: Shipment
    ) { }
}
