const { Order } = require("../models/Order");



exports.createOrder = async (req, res) => {
    // this order we have to get from API body
    const order = new Order(req.body)
    try {
        const doc = await order.save();
        res.status(200).json(doc)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.fetchOrderByUser = async (req, res) => {
    const { id } = req.user;

    try {
        const orders = await Order.find({ user: id });
        res.status(200).json(orders)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.updateOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByIdAndUpdate(id, req.body, { new: true }).populate('Product');
        res.status(200).json(order)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByIdAndDelete(id, req.body, { new: true });
        res.status(200).json(order)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.fetchAllOrders = async (req, res) => {
    // here we need all query string 

    let query = Order.find({ deleted: { $ne: true } })
    let totalOrdersQuery = Order.find({ deleted: { $ne: true } })

    // TODO: How to get shorting on discounted price not on actual price
    if (req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort]: req.query._order })
    }

    const totalOrders = await totalOrdersQuery.count().exec();
    console.log({ totalOrders });

    if (req.query._page && req.query._limit) {
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize * (page - 1)).limit(pageSize)
    }
    try {
        const doc = await query.exec();
        res.set('X-Total-Count', totalOrders)
        res.status(200).json(doc)
    } catch (err) {
        res.status(400).json(err)
    }
}