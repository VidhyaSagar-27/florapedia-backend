const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  vehicleType: {
    type: String,
    enum: ["Bike", "Scooter", "Cycle"]
  },

  location: {
    lat: Number,
    lng: Number
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  activeOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);