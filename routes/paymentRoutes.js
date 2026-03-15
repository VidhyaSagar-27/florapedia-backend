const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const auth = require("../middleware/authMiddleware");

router.post("/create-order", auth, async (req, res) => {
  try {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const { amount } = req.body;
    const options = { amount: amount * 100, currency: "INR", receipt: "rcpt_" + Date.now() };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, deliveryAddress } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
    if (expected !== razorpay_signature) return res.status(400).json({ message: "Payment verification failed" });
    const order = new Order({ user: req.user.id, items, totalAmount, paymentMethod: "ONLINE", paymentStatus: "paid", paymentId: razorpay_payment_id, deliveryAddress });
    const saved = await order.save();
    res.json({ message: "Payment successful", order: saved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;