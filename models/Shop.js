const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, default: "" },
  category: { type: String, enum: ["flower_shop","grocery_store","fruit_shop","vegetable_shop","bakery","general_store"], default: "general_store" },
  logo: { type: String, default: "" },
  banner: { type: String, default: "" },
  address: { street: String, city: String, state: String, pincode: String },
  phone: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Shop", shopSchema);