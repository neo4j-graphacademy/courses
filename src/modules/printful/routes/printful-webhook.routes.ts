/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express'
import markOrderShipped from '../services/mark-order-shipped'
import markOrderCreated from '../services/mark-order-created'
import { Order, ORDER_CREATED, ORDER_FAILED, ORDER_UPDATED, PACKAGE_SHIPPED, Shipment } from '../types'
import markOrderFailed from '../services/mark-order-failed'
import { notify } from '../../../middleware/bugsnag.middleware'

const router = Router()

router.post('/', async (req, res) => {
    const { type, created, retries, store, data, reason } = req.body
    try {
        const { order, shipment } = data

        switch (type) {
            case ORDER_CREATED:
                await markOrderCreated(order)
                break;

            case ORDER_UPDATED:
                await markOrderCreated(order)
                break;

            case PACKAGE_SHIPPED:
                await markOrderShipped(order as Order, shipment as Shipment)
                break;

            case ORDER_FAILED:
                await markOrderFailed(order as Order, reason as string)
                break;
        }
    }
    catch (e: any) {
        notify(e)
    }

    res.status(200).json({ status: 'OK' })
})

export default router
