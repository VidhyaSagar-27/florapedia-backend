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
    enum: ["Flower", "Grocery", "Bakery", "Fruits", "Vegetables"]
  },

  address: {
    type: String
  },

  location: {
    lat: Number,
    lng: Number
  },

  isOpen: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Shop", shopSchema);