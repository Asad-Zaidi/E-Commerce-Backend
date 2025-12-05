const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Load ENV
require("dotenv").config({
    path: require("path").join(__dirname, "..", ".env")
});

// DB
const connectDB = require("../config/db");
connectDB();

// Create app
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Middlewares
const visitTracker = require("../middlewares/visitTracker");
app.use(visitTracker);

// Routes
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/products", require("../routes/productRoutes"));
app.use("/api/admin", require("../routes/adminRoutes"));
app.use("/api/reviews", require("../routes/reviewRoutes"));
app.use("/api/banners", require("../routes/bannerRoutes"));
app.use("/api/categories", require("../routes/categoryRoutes"));
app.use("/api/home", require("../routes/homeRoutes"));
app.use("/api/contact", require("../routes/contactRoutes"));

// Default Route
app.get("/", (req, res) => {
    res.json({ message: "EDM Backend Running on Vercel" });
});

module.exports = app;
