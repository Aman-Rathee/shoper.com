const { Product } = require('../models/Product')


exports.createProduct = async (req, res) => {
    // this product we have to get from API body
    const product = new Product(req.body)
    try {
        const doc = await product.save();
        res.status(200).json(doc)
    } catch (err) {
        res.status(400).json(err)
    }
}

// TODO: we have to try with multiple category and brands after change in front-end
// filter = {"category": ["smartphone", "laptops"]}
// sort = {.sort:"price", _order= "desc"}
// pagination = {_page:"1", _limit=10}


exports.fetchAllProducts = async (req, res) => {
    // here we need all query string 

    let condition = {}
    if(!req.query.admin){
        condition.deleted = {$ne:true}
    }
    let query = Product.find(condition)
    let totalProductQuery = Product.find(condition)

    if (req.query.category) {
        query = query.find({ category: req.query.category })
        totalProductQuery = totalProductQuery.find({ category: req.query.category })
    }
    if (req.query.brand) {
        query = query.find({ brand: req.query.brand })
        totalProductQuery = totalProductQuery.find({ brand: req.query.brand })
    }
    // TODO: How to get shorting on discounted price not on actual price
    if (req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort]: req.query._order })
    }

    const totalProduct = await totalProductQuery.count().exec();
    console.log({ totalProduct });

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
    const {id} = req.params;

    try {
        const product = await Product.findById(id);
        res.status(200).json(product)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.updateProduct = async (req, res) => {
    const {id} = req.params;

    try {
        const product = await Product.findByIdAndUpdate(id, req.body, {new:true});
        res.status(200).json(product)
    } catch (err) {
        res.status(400).json(err)
    }
}