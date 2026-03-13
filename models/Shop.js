const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  description: {
    type: String
  },

  category: {
    type: String,
    enum: [
      "flower_shop",
      "grocery_store",
      "fruit_shop",
      "vegetable_shop",
      "bakery",
      "general_store"
    ]
  },

  logo: {
    type: String
  },

  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },

  location: {
    lat: Number,
    lng: Number
  },

  rating: {
    type: Number,
    default: 0
  },

  isOpen: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Shop", shopSchema);