
const OrderItem =require("../models/order_item")
const router = require('express').Router()

//////Delete all orderItem//////
router.delete("/", async (req, res) => {
    // try {
    //     let orderItem = await OrderItem.remove()
    //     if (orderItem) return res.status(200).json({ success: true, message: "the orderItem deleted successfully" })
    //     else {
    //         return res.status(404).json({ success: false, orderItem: "orderItem not found" })
    //     }
    // } catch (err) {
    //     res.status(400).json({ success: false, error: err })
    // }
    const orderItem = await OrderItem.remove()
    if (orderItem) return res.status(200).json({ success: true, message: "the orderItem deleted successfully" })
    else {
        return res.status(404).json({ success: false, orderItem: "orderItem not found" })
    }
})

//////Get all orders//////
router.get(`/`, async (req, res) => {
    const orderItem = await OrderItem.find()
    if (!orderItem) {
        res.status(500).json({ success: false })
    }
    res.send(orderItem)
})


module.exports = router