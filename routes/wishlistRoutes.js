const express = require("express");
const router = express.Router();

const Wishlist = require("../models/Wishlist");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// GET USER WISHLIST
// ===============================
router.get("/", authMiddleware, async (req, res) => {

  try {

    const wishlist = await Wishlist.findOne({
      user: req.user.id
    }).populate("products");

    res.json(wishlist || { products: [] });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ===============================
// ADD PRODUCT TO WISHLIST
// ===============================
router.post("/add/:productId", authMiddleware, async (req, res) => {

  try {

    let wishlist = await Wishlist.findOne({
      user: req.user.id
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: []
      });
    }

    if (!wishlist.products.includes(req.params.productId)) {
      wishlist.products.push(req.params.productId);
    }

    await wishlist.save();

    res.json({
      message: "Product added to wishlist"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ===============================
// REMOVE PRODUCT FROM WISHLIST
// ===============================
router.delete("/remove/:productId", authMiddleware, async (req, res) => {

  try {

    const wishlist = await Wishlist.findOne({
      user: req.user.id
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found"
      });
    }

    wishlist.products = wishlist.products.filter(
      p => p.toString() !== req.params.productId
    );

    await wishlist.save();

    res.json({
      message: "Product removed from wishlist"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;