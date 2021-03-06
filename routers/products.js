const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
//get products  
router.get(`/`, async(req, res) => {
    const products = await Product.find().populate('category');
    if (!products)
        return res.status(500).send('error while retrieving data');
    return res.status(200).json(products);

});

//get product by id
router.get(`/:id`, async(req, res) => {
    //validate id first
    if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('product id not vaild');

    const product = await Product.findById(req.params.id).populate('category');
    if (!product)
        return res.status(500).send('product id not vaild');
    return res.status(200).json(product);
});

//update product
router.put(`/:id`, async(req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('product id not vaild');

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invaild Categeory');

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDesciption: req.body.richDesciption,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, { new: true });

    if (!product)
        return res.status(500).send('the product cannot be created');

    res.status(200).json(product);
});

//post request
router.post(`/`, async(req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invaild Categeory');

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDesciption: req.body.richDesciption,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    product = await product.save();

    if (!product)
        return res.status(500).send('the product cannot be created');

    res.status(200).json(product);
});

//get products count
router.get(`/get/count`, async(req, res) => {
    const productsCount = await Product.countDocuments(count => count);
    if (!productsCount)
        return res.status(500).send('error while retrieving data');
    return res.status(200).send({ count: productsCount });

});

//get featured products 
router.get(`/get/featured/:count`, async(req, res) => {
    const count = req.params.count ? +req.params.count : 0;
    const featuredProducts = await Product.find({ isFeatured: true }).limit(count);
    if (!featuredProducts)
        return res.status(500).send('error while retrieving data');
    return res.status(200).json(featuredProducts);

});


module.exports = router;