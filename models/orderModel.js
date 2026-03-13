const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: String,
  price: Number,
  quantity: {
    type: Number,
    default: 1
  },
  image: String

});

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop"
  },

  items: [orderItemSchema],

  totalAmount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  paymentId: String,

  orderStatus: {
    type: String,
    enum: [
      "placed",
      "accepted",
      "preparing",
      "picked",
      "out_for_delivery",
      "delivered",
      "cancelled"
    ],
    default: "placed"
  },

  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryPartner"
  },

  deliveryAddress: {

    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String

  },

  acceptedAt: Date,
  pickedAt: Date,
  deliveredAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);