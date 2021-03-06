const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem');
const express = require('express');
const router = express.Router();

router.get(`/`, async(req, res) => {
    const orderList = await Order.find()
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: { path: 'product', select: 'name' }
        });

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList);
})

router.post(`/`, async(req, res) => {
    const orderItemsIds = await Promise.all(req.body.orderItems.map(async(orderItem) => {
        let newOrderItem = new OrderItem({
            product: orderItem.product,
            quantity: orderItem.quantity
        });
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }));

    //calculate total price
    let totalPrices = await Promise.all(orderItemsIds.map(async(orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalprice = orderItem.product.price * orderItem.quantity;
        return totalprice;
    }));
    totalPrices = totalPrices.reduce((a, b) => { return a + b });

    let order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        phone: req.body.phone,
        status: req.body.status,
        user: req.body.user,
        totalPrice: totalPrices
    });

    order = await order.save();
    if (!order)
        return res.status(404).send('Error while creating new order');
    res.send(order);
});

router.put(`/:id`, async(req, res) => {

    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    }, { new: true });

    if (!order)
        return res.status(404).send('Error while updating an order');
    res.send(order);
});

router.delete(`/:id`, (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            //Deleting every related order item
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem);
            });

            return res.status(200).json({ success: true, message: `the order has been deleted` });
        } else {
            return res.status(404).json({ success: false, message: `order id not found` });
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, error: err });
    });
})

module.exports = router;