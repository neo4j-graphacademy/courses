import { User } from "../../../domain/model/user";
import { Reward } from "../../../domain/services/rewards/get-rewards";
import { Order } from "../types";

export class OrderCreated {
    constructor(
        public readonly user: User,
        public readonly reward: Reward,
        public readonly order: Order,
    ) { }
}
