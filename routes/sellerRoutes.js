const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

/* ================= ADD PRODUCT ================= */

router.post("/product", async (req, res) => {

  try {

    const {
      name,
      price,
      image,
      description,
      seller,
      shop
    } = req.body;

    const product = new Product({
      name,
      description: description || "Flower product",
      price,
      images: [image],
      seller,
      shop
    });

    await product.save();

    res.json({
      message: "Product added successfully",
      product
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Error adding product"
    });

  }

});


/* ================= GET PRODUCTS ================= */

router.get("/products", async (req, res) => {

  const products = await Product.find().populate("seller");

  res.json(products);

});


/* ================= DELETE PRODUCT ================= */

router.delete("/product/:id", async (req, res) => {

  await Product.findByIdAndDelete(req.params.id);

  res.json({
    message: "Product deleted"
  });

});

module.exports = router;