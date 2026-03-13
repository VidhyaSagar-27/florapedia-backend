const express = require("express");
const router = express.Router();

const DeliveryPartner = require("../models/deliveryPartnerModel");


// Register delivery partner
router.post("/register", async (req, res) => {

  try {

    const partner = new DeliveryPartner(req.body);

    const saved = await partner.save();

    res.status(201).json(saved);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});


// Get available partners
router.get("/available", async (req, res) => {

  try {

    const partners = await DeliveryPartner.find({
      isAvailable: true
    });

    res.json(partners);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});

module.exports = router;