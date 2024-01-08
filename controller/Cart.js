const { Cart } = require("../models/Cart");


exports.fetchCartByUser = async (req, res) => {
    const { id } = req.user;

    try {
        const cartItems = await Cart.find({ user: id }).populate('product');
        res.status(200).json(cartItems)
    } catch (err) {
        res.status(400).json(err)
    }
}


exports.addToCart = async (req, res) => {
    const { id } = req.user;
    // this product we have to get from API body
    const cart = new Cart({ ...req.body, user: id })
    try {
        const doc = await cart.save();
        const result = await doc.populate('product')
        res.status(200).json(result)
    } catch (err) {
        res.status(400).json(err)
    }
}


exports.updateCart = async (req, res) => {
    const { id } = req.params;

    try {
        const cart = await Cart.findByIdAndUpdate(id, req.body, { new: true }).populate('product');
        res.status(200).json(cart)
    } catch (err) {
        res.status(400).json(err)
    }
}


exports.deleteFromCart = async (req, res) => {
    const { id } = req.params;

    try {
        const cart = await Cart.findByIdAndDelete(id, req.body, { new: true });
        res.status(200).json(cart)
    } catch (err) {
        res.status(400).json(err)
    }
}