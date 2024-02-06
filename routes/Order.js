
const express = require('express');
const { createOrder, fetchOrderByUser, updateOrder, deleteOrder, fetchAllOrders } = require('../controller/Order');

const router = express.Router();

//   /orders is already added in base path
router.post('/', createOrder)
    .get('/', fetchAllOrders)
    .get('/my', fetchOrderByUser)
    .patch('/:id', updateOrder)
    .delete('/:id', deleteOrder)

exports.router = router;