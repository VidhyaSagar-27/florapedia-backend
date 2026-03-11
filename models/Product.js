const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  description: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  category: {
    type: String,
    default: "Plants"
  },

  stock: {
    type: Number,
    default: 10,
    min: 0
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  rating: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);