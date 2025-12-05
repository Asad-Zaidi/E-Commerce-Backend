// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
// const connectDB = require("./config/db");

// const authRoutes = require("./routes/authRoutes");
// const productRoutes = require("./routes/productRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");
// const bannerRoutes = require("./routes/bannerRoutes");
// const categoryRoutes = require("./routes/categoryRoutes");
// const visitTracker = require("./middlewares/visitTracker");
// const homeRoutes = require("./routes/homeRoutes");

// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(morgan("dev"));
// app.use(visitTracker);

// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/banners", bannerRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("api/home", homeRoutes);

// app.use((req, res) => {
//     res.status(404).json({ message: "Response OK" });
// });

// const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
// app.listen(PORT, () => console.log(`Server running`));


// server.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const visitTracker = require("./middlewares/visitTracker");
const homeRoutes = require("./routes/homeRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(visitTracker);

// Connect to MongoDB (serverless-friendly)
connectDB()
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("DB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/contact", contactRoutes);

// Default route for unknown endpoints
app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
});

module.exports = app;
