const express = require("express");
const router = express.Router();

const Order = require("../models/orderModel");
const Product = require("../models/Product");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// ADMIN CHECK MIDDLEWARE
// ===============================
const adminOnly = (req, res, next) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};



// ===============================
// DASHBOARD STATS
// ===============================
router.get("/stats", authMiddleware, adminOnly, async (req, res) => {

  try {

    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});



// ===============================
// RECENT ORDERS
// ===============================
router.get("/recent-orders", authMiddleware, adminOnly, async (req, res) => {

  try {

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});



// ===============================
// MONTHLY SALES
// ===============================
router.get("/monthly-sales", authMiddleware, adminOnly, async (req, res) => {

  try {

    const sales = await Order.aggregate([

      {
        $match: { paymentStatus: "paid" }
      },

      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },

      {
        $sort: { "_id": 1 }
      }

    ]);

    res.json(sales);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


module.exports = router;