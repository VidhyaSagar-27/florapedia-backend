const DeliveryPartner = require("../models/deliveryPartnerModel");
const express = require("express");
const router = express.Router();

const Order = require("../models/orderModel");
const authMiddleware = require("../middleware/authMiddleware");


// ======================================
// CREATE ORDER
// ======================================
router.post("/", authMiddleware, async (req, res) => {

  try {

    const {
      items,
      totalAmount,
      paymentMethod,
      deliveryAddress
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item"
      });
    }

    // Find available delivery partner
    const partner = await DeliveryPartner.findOne({
      isAvailable: true
    });

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      deliveryPartner: partner ? partner._id : null
    });

    const savedOrder = await order.save();

    // Mark partner busy
    if (partner) {

      partner.isAvailable = false;
      partner.activeOrder = savedOrder._id;

      await partner.save();
    }

    res.status(201).json(savedOrder);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// GET USER ORDERS
// ======================================
router.get("/my-orders", authMiddleware, async (req, res) => {

  try {

    const orders = await Order.find({
      user: req.user.id
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// GET SINGLE ORDER
// ======================================
router.get("/:id", authMiddleware, async (req, res) => {

  try {

    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// GET ALL ORDERS (ADMIN)
// ======================================
router.get("/", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// UPDATE ORDER STATUS
// ======================================
router.put("/:id/status", authMiddleware, async (req, res) => {

  try {

    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.orderStatus = orderStatus;

    // If delivered → free delivery partner
    if (orderStatus === "delivered" && order.deliveryPartner) {

      const partner = await DeliveryPartner.findById(order.deliveryPartner);

      if (partner) {
        partner.isAvailable = true;
        partner.activeOrder = null;
        await partner.save();
      }

      order.deliveredAt = new Date();
    }

    await order.save();

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ======================================
// CANCEL ORDER (USER)
// ======================================
router.put("/:id/cancel", authMiddleware, async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


module.exports = router;