const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");
const authMiddleware = require("../middleware/authMiddleware");


// CREATE SHOP
router.post("/", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can create shops"
      });
    }

    const shop = new Shop({
      ...req.body,
      owner: req.user.id
    });

    const savedShop = await shop.save();

    res.status(201).json(savedShop);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// GET ALL SHOPS
router.get("/", async (req, res) => {

  try {

    const shops = await Shop.find()
      .populate("owner", "name");

    res.json(shops);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// GET SINGLE SHOP
router.get("/:id", async (req, res) => {

  try {

    const shop = await Shop.findById(req.params.id)
      .populate("owner", "name email");

    res.json(shop);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;