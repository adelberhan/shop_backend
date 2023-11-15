const { Order } = require("../models/order")
const { OrderItem } = require("../models/order_item");
const Product = require("../models/product")
const router = require('express').Router();
const stripe = require('stripe')('sk_test_51NDTB0HSGwOehr5IBepmfOC2Bu1Fmz2OvKIEbbHyHwWFiKMWy2xoDi3HsNIBCv9ij0MOt0KbHXpxoxIa203zEnmm00aKhqw1BB')

//////Get all orders//////
router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 })
    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList)
})

//////Get  order//////
router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product', populate: 'category'
            }
        }).sort({ 'dateOrdered': -1 })
    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order)
})


////// Post a order //////
router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product

        })
        newOrderItem = await newOrderItem.save()

        return newOrderItem._id;
    }))

    const orderItemsResolved = await orderItemsIds
    const totalPrices = await Promise.all(orderItemsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    console.log(totalPrice)
    let order = new Order({
        orderItems: orderItemsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order)
        return res.status(400).send('the order cannot be created!')

    res.send(order);
})

////// Post a order //////
router.post('/create-checkout-session', async (req, res) => {
    const orderItems = req.body;


    if (!orderItems) {
        return res.status(400).send('The order cannot be created');
    }

    const lineItems = await Promise.all(orderItems.map(async (orderItem) => {
        const product = await Product.findById(orderItem.product)
        return {
            price_data: {
                currency: "USD", product_data: {
                    name: product.name
                },
                unit_amount: product.price * 100,
            },
            quantity: orderItem.quantity,
        }

    }))
    session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: 'https://my-ng-shop.netlify.app/success',
        cancel_url: 'https://my-ng-shop.netlify.app/error',
    }),
        res.json({
            id: session.id,
        })
})

//////Update a order//////

router.put('/:id', async (req, res) => {
    try {
        let order = await Order.findByIdAndUpdate(req.params.id, {
            status: req.body.status
        }, { new: true })
        if (!order) { return res.status(404).send("Not found...") }
        return res.status(200).send(order)
    } catch (error) {
        res.json({ error: error })

    }
})

//////Delete a order//////
router.delete("/:id", async (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "order not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

//////Total orders//////
router.get('/get/total_seals', async (rea, res) => {
    const totalSeals = await Order.aggregate([{
        $group: { _id: null, totalSeals: { $sum: '$totalPrice' } }
    }])
    if (!totalSeals) { res.status(400).send('The order cannot be aggregate') }

    res.send({ totalSeals: totalSeals.pop().totalSeals })
})

//////count all orders//////
router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        orderCount: orderCount
    });


})


//////History orders//////
router.get('/get/user_orders/:userid', async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid }).populate({
        path: 'orderItems',
        populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 })

    if (!userOrderList) { res.status(400).send('There is no order history for this user') }

    res.send(userOrderList)

})








module.exports = router
