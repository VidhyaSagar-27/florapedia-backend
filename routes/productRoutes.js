const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");


// ======================================
// CREATE PRODUCT (SELLER)
// ======================================
router.post("/", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can add products"
      });
    }

    const {
      name,
      price,
      description,
      images,
      category,
      stock,
      unit,
      discountPrice,
      shop
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price are required"
      });
    }

    const product = new Product({
      name,
      price,
      description,
      images,
      category,
      stock,
      unit,
      discountPrice,
      shop,
      seller: req.user.id
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// GET SELLER PRODUCTS
// ======================================
router.get("/seller/my-products", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const products = await Product.find({
      seller: req.user.id
    }).sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// GET ALL PRODUCTS (SEARCH + FILTER)
// ======================================
router.get("/", async (req, res) => {

  try {

    const {
      search,
      category,
      page = 1,
      limit = 20
    } = req.query;

    const query = {
      isActive: true
    };

    if (search) {
      query.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("seller", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// TRENDING PRODUCTS
// ======================================
router.get("/trending/list", async (req, res) => {

  try {

    const products = await Product.find({ isActive: true })
      .sort({ rating: -1, ratingCount: -1 })
      .limit(10);

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// GET PRODUCT CATEGORIES
// ======================================
router.get("/categories/list", async (req, res) => {

  try {

    const categories = await Product.distinct("category");

    res.json(categories);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// GET SINGLE PRODUCT
// ======================================
router.get("/:id", async (req, res) => {

  try {

    const product = await Product.findById(req.params.id)
      .populate("seller", "name email")
      .populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// ADD PRODUCT REVIEW
// ======================================
router.post("/:id/review", authMiddleware, async (req, res) => {

  try {

    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "Product already reviewed"
      });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);

    product.ratingCount = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.json({
      message: "Review added successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// UPDATE PRODUCT
// ======================================
router.put("/:id", authMiddleware, async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Product updated",
      product: updatedProduct
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// DELETE PRODUCT
// ======================================
router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    await product.deleteOne();

    res.json({
      message: "Product deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


module.exports = router;