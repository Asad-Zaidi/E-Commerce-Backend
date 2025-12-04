const HomeSection = require("../models/Home");

// GET current home page data
exports.getHomeSections = async (req, res) => {
    try {
        const homeSections = await HomeSection.find().sort({ createdAt: -1 }).limit(1);
        if (homeSections.length === 0) return res.status(404).json({ message: "No home sections found" });
        res.json(homeSections[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// CREATE or UPDATE home page data
exports.updateHomeSections = async (req, res) => {
    try {
        const { intro, pricingCTA, trustIndicators, testimonials } = req.body;

        let homeSection = await HomeSection.findOne();
        if (homeSection) {
            // Update existing
            homeSection.intro = intro;
            homeSection.pricingCTA = pricingCTA;
            homeSection.trustIndicators = trustIndicators;
            homeSection.testimonials = testimonials;
            await homeSection.save();
        } else {
            // Create new
            homeSection = new HomeSection({
                intro,
                pricingCTA,
                trustIndicators,
                testimonials
            });
            await homeSection.save();
        }

        res.json({ message: "Home sections updated successfully", homeSection });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
