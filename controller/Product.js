const { Product } = require('../models/Product')


exports.createProduct = async (req, res) => {
    const product = new Product(req.body);
    product.discountedPrice = Math.round(product.price * (1 - product.discountPercentage / 100))
    try {
        const doc = await product.save();
        res.status(200).json(doc)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.fetchAllProducts = async (req, res) => {
    // filter = {"category": ["smartphone", "laptops"]}
    // sort = {.sort:"price", _order= "desc"}
    // pagination = {_page:"1", _limit=15}

    let condition = {}
    if (!req.query.admin) {
        condition.deleted = { $ne: true }
    }
    let query = Product.find(condition)
    let totalProductQuery = Product.find(condition)

    if (req.query.category) {
        query = query.find({ category: { $in: req.query.category.split(',') } })
        totalProductQuery = totalProductQuery.find({ category: { $in: req.query.category.split(',') } })
    }
    if (req.query.brand) {
        query = query.find({ brand: { $in: req.query.brand.split(',') } })
        totalProductQuery = totalProductQuery.find({ brand: { $in: req.query.brand.split(',') } })
    }
    if (req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort]: req.query._order })
    }

    const totalProduct = await totalProductQuery.count().exec();

    if (req.query._page && req.query._limit) {
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize * (page - 1)).limit(pageSize)
    }
    try {
        const doc = await query.exec();
        res.set('X-Total-Count', totalProduct)
        res.status(200).json(doc)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.fetchProductsById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        res.status(200).json(product)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        product.discountedPrice = Math.round(product.price * (1 - product.discountPercentage / 100))
        const doc = await product.save();
        res.status(200).json(doc)
    } catch (err) {
        res.status(400).json(err)
    }
}