const express = require("express");
const router = express.Router();

const Order = require("../models/orderModel");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================+
// CREATE ORDER
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {

    const { products, totalPrice } = req.body;

    const order = new Order({
      user: req.user.id,
      products,
      totalPrice
    });

    const savedOrder = await order.save();

    res.status(201).json(savedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET USER ORDERS
// ===============================
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user.id })
      .populate("products.product");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET ALL ORDERS (ADMIN)
// ===============================
router.get("/", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;