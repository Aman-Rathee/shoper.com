
const express = require('express');
const { addToCart, fetchCartByUser, deleteFromCart, updateCart } = require('../controller/Cart');

const router = express.Router();

//   /users is already added in base path
router.post('/', addToCart)
    .get('/', fetchCartByUser)
    .patch('/:id', updateCart)
    .delete('/:id', deleteFromCart)

exports.router = router;