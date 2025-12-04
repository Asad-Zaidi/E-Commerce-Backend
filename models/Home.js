const mongoose = require("mongoose");

const trustIndicatorSchema = new mongoose.Schema({
    icon: String,
    label: String,
    value: String
});

const testimonialSchema = new mongoose.Schema({
    name: String,
    title: String,
    text: String,
    avatar: String
});

const homeSchema = new mongoose.Schema({
    intro: {
        title: { type: String, required: true },
        subtitle: String
    },
    pricingCTA: {
        title: String,
        subtitle: String,
        ctaText: String
    },
    trustIndicators: [trustIndicatorSchema],
    testimonials: [testimonialSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Home", homeSchema);
