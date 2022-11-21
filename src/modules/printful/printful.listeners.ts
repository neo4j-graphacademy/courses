import { emitter } from "../../events";
import { prepareAndSend } from "../mailer";
import { OrderCreated } from "./events/OrderCreated";
import { PackageShipped } from "./events/PackageShipped";

export default function initPrintfulListeners(): void {

    emitter.on<OrderCreated>(OrderCreated, ({ user, order }) => {
        if (user.email) {
            prepareAndSend('tshirt-ordered', user.email, {
                order,
            })
        }
    })

    emitter.on<PackageShipped>(PackageShipped, ({ user, order, shipment }) => {
        if (user.email) {
            prepareAndSend('tshirt-ordered', user.email, {
                order,
                shipment,
            })
        }
    })

}
