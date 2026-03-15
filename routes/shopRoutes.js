const express = require("express");
const router = express.Router();
const Shop = require("../models/Shop");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// CREATE SHOP
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ message: "Sellers only" });
    const existing = await Shop.findOne({ owner: req.user.id });
    if (existing) {
      const updated = await Shop.findByIdAndUpdate(existing._id, req.body, { new: true });
      return res.json({ message: "Shop updated", shop: updated });
    }
    const shop = new Shop({ ...req.body, owner: req.user.id });
    const saved = await shop.save();
    await User.findByIdAndUpdate(req.user.id, { shopId: saved._id });
    res.status(201).json({ message: "Shop created", shop: saved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET MY SHOP
router.get("/my-shop", auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    res.json(shop || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET ALL SHOPS
router.get("/", async (req, res) => {
  try {
    const shops = await Shop.find({ isApproved: true }).populate("owner", "name");
    res.json(shops);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET SINGLE SHOP
router.get("/:id", async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate("owner", "name email");
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;