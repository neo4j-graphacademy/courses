import { User } from "../../../domain/model/user";
import { emitter } from "../../../events";
import { notify } from "../../../middleware/bugsnag.middleware";
import { write } from "../../neo4j";
import EnrolmentNotFoundError from "../errors/enrolment-not-found.error";
import { PackageShipped } from "../events/PackageShipped";
import { Order, Shipment } from "../types";

export default async function markPackageShipped(order: Order, shipment: Shipment): Promise<void> {
    const [slug, sub] = order.external_id.split('||')

    // Set information in URL
    const res = await write(`
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e:CompletedEnrolment)-[:FOR_COURSE]->(c:Course {slug: $slug})
        SET e.tshirtShippedAt = [$shipment.ship_date, datetime({epochSeconds: $shipment.shipped_at})],
            e.tshirtTrackingNumber = $shipment.tracking_number,
            e.tshirtTrackingUrl = $shipment.tracking_url

        RETURN u
    `, { sub, slug, shipment })

    // Could not find enrolment?
    if (res.records.length === 0) {
        notify(new EnrolmentNotFoundError(`Could not find order ${order.external_id}`), e => {
            e.setUser(sub)

            e.addMetadata('order', order)
            e.addMetadata('shipment', shipment)
        })

        return
    }

    // Trigger Event
    const user: User = res.records[0].get('u')

    // Fire event
    emitter.emit(new PackageShipped(user, order, shipment))
}
