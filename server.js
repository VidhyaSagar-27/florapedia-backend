const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);      // 🔐 Authentication routes
app.use("/api/products", productRoutes);  // 🛒 Product routes (ADD THIS BELOW AUTH)

// Test route
app.get("/", (req, res) => {
  res.send("Florapedia Backend Running");
});

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("Database Connected"))
.catch(err => console.log("DB Error:", err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});