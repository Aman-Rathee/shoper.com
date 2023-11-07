const { Category } = require("../models/Category");

exports.fetchCategories = async (req, res) => {

    try {
        const categories = await Category.find({});
        res.status(200).json(categories)
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.createCategory = async (req, res) => {
    // this product we have to get from API body
    const category = new Category(req.body)
    try {
        const doc = await category.save();
        res.status(200).json(doc)
    } catch (err) {
        res.status(400).json(err)
    }
}