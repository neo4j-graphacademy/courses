/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express'
import markOrderShipped from '../services/mark-order-shipped'
import markOrderCreated from '../services/mark-order-created'
import { Order, ORDER_CREATED, ORDER_FAILED, PACKAGE_SHIPPED, Shipment } from '../types'
import markOrderFailed from '../services/mark-order-failed'

const router = Router()

router.post('/', async (req, res) => {
    const { type, created, retries, store, data, reason } = req.body
    const { order, shipment } = data

    switch (type) {
        case ORDER_CREATED:
            await markOrderCreated(order)
            break;

        case PACKAGE_SHIPPED:
            await markOrderShipped(order as Order, shipment as Shipment)
            break;

        case ORDER_FAILED:
            await markOrderFailed(order as Order, reason as string)
            break;
    }

    res.status(200).json({ status: 'OK' })
})

export default router
