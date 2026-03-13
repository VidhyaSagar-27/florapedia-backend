const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String
  }

}, { timestamps: true });



const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  discountPrice: {
    type: Number,
    default: 0
  },

  images: [
    {
      type: String
    }
  ],

  category: {
    type: String,
    default: "General"
  },

  tags: [
    {
      type: String
    }
  ],

  unit: {
    type: String,
    default: "piece"
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

  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },

  reviews: [reviewSchema],

  rating: {
    type: Number,
    default: 0
  },

  ratingCount: {
    type: Number,
    default: 0
  },

  deliveryTime: {
    type: Number,
    default: 30
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);