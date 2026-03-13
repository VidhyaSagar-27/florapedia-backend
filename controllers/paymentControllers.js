const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


// CREATE PAYMENT ORDER
exports.createPaymentOrder = async (req, res) => {

  try {

    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      deliveryAddress
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {

      return res.status(400).json({
        message: "Payment verification failed"
      });

    }

    const order = new Order({

      user: req.user.id,
      items,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      deliveryAddress

    });

    const savedOrder = await order.save();

    res.json({
      message: "Payment successful",
      order: savedOrder
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};