const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

// GET ALL PRODUCTS (public)
router.get("/", async (req, res) => {
  try {
    const { search, category, seller, page = 1, limit = 40 } = req.query;
    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (seller) query.seller = seller;
    const products = await Product.find(query)
      .populate("seller", "name email")
      .populate("shop", "name")
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET SELLER'S OWN PRODUCTS
router.get("/my-products", auth, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ message: "Sellers only" });
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET CATEGORIES
router.get("/categories/list", async (req, res) => {
  try {
    const cats = await Product.distinct("category");
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email").populate("shop", "name address");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE PRODUCT (seller only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ message: "Sellers only" });
    const { name, price, description, images, category, stock, unit, discountPrice, shop } = req.body;
    if (!name || !price) return res.status(400).json({ message: "Name and price required" });
    const product = new Product({ name, price, description, images, category, stock, unit, discountPrice, shop, seller: req.user.id, isActive: true });
    const saved = await product.save();
    res.status(201).json({ message: "Product created", product: saved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE PRODUCT
router.put("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    if (product.seller.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Updated", product: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE PRODUCT
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    if (product.seller.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "Not authorized" });
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADD REVIEW
router.post("/:id/review", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    const already = product.reviews.find(r => r.user.toString() === req.user.id);
    if (already) return res.status(400).json({ message: "Already reviewed" });
    product.reviews.push({ user: req.user.id, name: req.body.name, rating: Number(rating), comment });
    product.ratingCount = product.reviews.length;
    product.rating = product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length;
    await product.save();
    res.json({ message: "Review added" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;