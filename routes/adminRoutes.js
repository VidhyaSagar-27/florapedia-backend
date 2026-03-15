const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Shop = require("../models/Shop");
const auth = require("../middleware/authMiddleware");

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};

router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalShops, revenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Shop.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }])
    ]);
    res.json({ totalUsers, totalProducts, totalOrders, totalShops, totalRevenue: revenue[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/orders", auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("user","name email").populate("items.product").sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/products/:id", auth, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;