const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product')
//if you add code after the initial response you need to RETURN the first response
//if you are using a query such as find, findbyId, etc. then you have to call exec() to make it into a promise
router.get('/', (req, res, next) => {

    Order.find().select('_id product quantity').exec().then(docs => {
        const id = req.body._id
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            }),

        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({ error: err })
    })
})


//generate a UUID like how we are below;
router.post('/', (req, res, next) => {

    Product.findById(req.body.productId).then(product => {
        if (!product) {
            //since we are returning, all after code won't run
            return res.status(404).json({
                message: 'product not found'
            })
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        return order.save()
    }).then(result => {
        res.status(201).json({
            message: 'Order successfully created',
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders/' + result._id
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({ error: err })
    })


})


router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId).exec().then(order => {
        if (!order) {
            return res.status(404).json({
                message: 'no order found'
            })
        }
        return res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        })
    }).catch(err => {
        res.status(500).json({ error: err })
    })
})

router.delete('/:orderId', (req, res, next) => {

    Order.deleteOne({ _id: req.params.orderId })
        .exec().then(result => {
            if (!result._id) {
                return res.status(404).json({
                    message: 'nothing to delete'
                })
            }
            res.status(200).json({

                message: 'Order Deleted',
                reuqest: {
                    _id: result._id,
                    url: 'http://localhost:3000/orders',
                    body: { productId: 'ID', quantity: 'Number' }
                }

            })
        }).catch(err => res.status(404).json({ error: err }))


})


module.exports = router;