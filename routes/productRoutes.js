const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// CREATE PRODUCT (Seller only)
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can add products" });
    }

    const { name, price, description, image, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      stock,
      seller: req.user.id
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET ALL PRODUCTS (Public)
// ===============================
router.get("/", async (req, res) => {
  try {

    const products = await Product
      .find()
      .populate("seller", "name email");

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET SINGLE PRODUCT
// ===============================
router.get("/:id", async (req, res) => {
  try {

    const product = await Product
      .findById(req.params.id)
      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET SELLER PRODUCTS
// ===============================
router.get("/seller/my-products", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Access denied" });
    }

    const products = await Product.find({ seller: req.user.id });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// UPDATE PRODUCT
// ===============================
router.put("/:id", authMiddleware, async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
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
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// DELETE PRODUCT
// ===============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;