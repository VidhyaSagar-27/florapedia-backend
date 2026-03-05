const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

// Add product (ONLY SELLER)
router.post("/add", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can add products" });
    }

    const { name, price, description, image } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
      seller: req.user.id
    });

    await product.save();
    res.json({ message: "Product added successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (Public)
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get logged-in seller products
router.get("/my-products", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Access denied" });
    }

    const products = await Product.find({ seller: req.user.id });

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;