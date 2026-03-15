const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const w = await Wishlist.findOne({ user: req.user.id }).populate("products");
    res.json(w || { products: [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/toggle/:productId", auth, async (req, res) => {
  try {
    let w = await Wishlist.findOne({ user: req.user.id });
    if (!w) w = new Wishlist({ user: req.user.id, products: [] });
    const idx = w.products.findIndex(p => p.toString() === req.params.productId);
    if (idx >= 0) { w.products.splice(idx, 1); await w.save(); return res.json({ message: "Removed", wishlisted: false }); }
    w.products.push(req.params.productId);
    await w.save();
    res.json({ message: "Added", wishlisted: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;