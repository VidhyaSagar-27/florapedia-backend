const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: {
    type: String,
    default: "India"
  }
});

const UserSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  phone: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: [
      "customer",
      "seller",
      "delivery",
      "admin"
    ],
    default: "customer"
  },

  avatar: {
    type: String,
    default: ""
  },

  address: AddressSchema,

  isVerified: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // For delivery partners
  deliveryDetails: {
    vehicleType: String,
    vehicleNumber: String,
    isAvailable: {
      type: Boolean,
      default: false
    }
  },

  // For shop owners
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("User", UserSchema);