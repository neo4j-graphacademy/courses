/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express'
import markPackageShipped from '../services/mark-package-shipped'
import markTshirtOrderCreated from '../services/mark-tshirt-order-created'
import { Order, ORDER_CREATED, PACKAGE_SHIPPED, Shipment } from '../types'

const router = Router()

router.post('/', async (req, res) => {
    const { type, created, retries, store, data } = req.body
    const { order, shipment } = data

    switch (type) {
        case ORDER_CREATED:
            await markTshirtOrderCreated(order)
            break;

        case PACKAGE_SHIPPED:
            await markPackageShipped(order as Order, shipment as Shipment)
            break;
    }

    res.status(200).json({ status: 'OK' })
})

export default router
