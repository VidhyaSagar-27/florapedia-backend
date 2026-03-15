const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/authMiddleware");

// CREATE ORDER
router.post("/", auth, async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, deliveryAddress, shop } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: "No items" });
    const order = new Order({ user: req.user.id, items, totalAmount, paymentMethod, deliveryAddress, shop });
    if (paymentMethod === "COD") order.paymentStatus = "pending";
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET MY ORDERS (customer)
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET SELLER ORDERS (orders containing seller's products)
router.get("/seller-orders", auth, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ message: "Sellers only" });
    const orders = await Order.find({ shop: req.body.shopId })
      .populate("user", "name email phone").populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET ALL ORDERS (admin)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const orders = await Order.find().populate("user","name email").populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET SINGLE ORDER
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product").populate("user","name email");
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE STATUS
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CANCEL ORDER
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "Not authorized" });
    order.orderStatus = "cancelled";
    await order.save();
    res.json({ message: "Cancelled", order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;