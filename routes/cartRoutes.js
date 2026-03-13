const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");


// ADD TO CART
router.post("/add", authMiddleware, async (req, res) => {

  try {

    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1
      });
    }

    await cart.save();

    res.json(cart);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});


// GET CART
router.get("/", authMiddleware, async (req, res) => {

  try {

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.json(cart);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});


// REMOVE ITEM
router.delete("/remove/:productId", authMiddleware, async (req, res) => {

  try {

    const cart = await Cart.findOne({ user: req.user.id });

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();

    res.json(cart);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});


// CLEAR CART
router.delete("/clear", authMiddleware, async (req, res) => {

  try {

    const cart = await Cart.findOne({ user: req.user.id });

    cart.items = [];

    await cart.save();

    res.json({ message: "Cart cleared" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});

module.exports = router;