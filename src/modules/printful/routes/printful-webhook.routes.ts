/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express'
import markOrderShipped from '../services/mark-order-shipped'
import markOrderCreated from '../services/mark-order-created'
import { Order, ORDER_CREATED, PACKAGE_SHIPPED, Shipment } from '../types'

const router = Router()

router.post('/', async (req, res) => {
    const { type, created, retries, store, data } = req.body
    const { order, shipment } = data

    switch (type) {
        case ORDER_CREATED:
            await markOrderCreated(order)
            break;

        case PACKAGE_SHIPPED:
            await markOrderShipped(order as Order, shipment as Shipment)
            break;
    }

    res.status(200).json({ status: 'OK' })
})

export default router
