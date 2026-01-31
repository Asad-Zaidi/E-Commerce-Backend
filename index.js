const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("../config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// DB connection (connect once at startup)
connectDB().then(() => console.log("MongoDB Connected"))
            .catch(err => console.error("DB Connection Error:", err));

// Visit tracker
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
app.use("/api/messages", require("../routes/messageRoutes"));

// Default route
app.get("/", (req, res) => {
    res.json({ message: "Backend Running on Vercel" });
});

module.exports = app;

