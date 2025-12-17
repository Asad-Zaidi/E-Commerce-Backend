const HomeSection = require("../models/Home");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const INTRO_MODEL = "gemini-2.0-flash";

// GET current home page data
exports.getHomeSections = async (req, res) => {
    try {
        let homeSection = await HomeSection.findOne();

        // If no data exists, return default structure
        if (!homeSection) {
            return res.json({
                intro: { title: "", subtitle: "" },
                pricingCTA: {},
                trustIndicators: [],
                testimonials: []
            });
        }

        res.json(homeSection);
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

// Generate intro copy via Gemini
// exports.generateIntroAI = async (req, res) => {
//     try {
//         if (!genAI) {
//             return res.status(500).json({ message: "AI service is not configured" });
//         }

//         const { businessName = "ServiceHub", focus = "Digital and Subscription Tools and accounts" } = req.body || {};

//         const prompt = `Return a JSON object for a homepage hero section with concise copy. Business: ${businessName}. Focus: ${focus}. Respond only with JSON in the format {"title":"<6-10 words>","subtitle":"<18-26 words>"}. Keep the tone energetic and trustworthy.`;

//         const model = genAI.getGenerativeModel({ model: INTRO_MODEL });
//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const raw = response.text();

//         const cleaned = raw.replace(/```json|```/gi, "").trim();

//         let parsed;
//         try {
//             parsed = JSON.parse(cleaned);
//         } catch (parseErr) {
//             console.error("Failed to parse AI intro JSON:", parseErr.message);
//             return res.status(500).json({ message: "AI response was not usable" });
//         }

//         if (!parsed.title || !parsed.subtitle) {
//             return res.status(500).json({ message: "AI did not return intro text" });
//         }

//         return res.json({ intro: { title: parsed.title, subtitle: parsed.subtitle } });
//     } catch (err) {
//         console.error("AI intro generation failed:", err.message);
//         res.status(500).json({ message: "Failed to generate intro", error: err.message });
//     }
// };

exports.generateIntroAI = async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({
                message: "AI service is not configured"
            });
        }

        const {
            businessName = "ServiceHub"
        } = req.body || {};

        const prompt = `
You are generating homepage hero content for a professional digital subscription marketplace.

Business Name: ${businessName}

Business Description:
The platform sells subscriptions for ALL types of digital services, including but not limited to:
- Entertainment and streaming platforms
- AI and automation tools
- Educational and learning platforms
- Creative and design software
- Productivity and business tools
- Development and software services

Key Value Propositions:
- Affordable and flexible subscription plans
- Trusted, verified, and instant access
- Wide range of global digital platforms
- Secure and reliable service

Write concise, high-conversion hero copy.

STRICT REQUIREMENTS:
- Return ONLY valid JSON
- No markdown, no explanations
- Use professional, trustworthy, energetic tone

CONTENT RULES (STRICT):
- Return ONLY valid JSON
- No markdown, no explanations, no extra text
- Professional, trustworthy, energetic tone
- Title must be 6–10 words
- Subtitle must be 40–60 words

JSON FORMAT:
{
    "title": "<6-10 words>",
    "subtitle": "<40-60 words>"
}
`;

        const model = genAI.getGenerativeModel({ model: INTRO_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw = response.text();

        const cleaned = raw.replace(/```json|```/gi, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (err) {
            console.error("AI JSON parsing failed:", cleaned);
            return res.status(500).json({
                message: "AI response was not usable"
            });
        }

        if (!parsed.title || !parsed.subtitle) {
            return res.status(500).json({
                message: "AI did not return valid intro content"
            });
        }

        return res.json({
            intro: {
                title: parsed.title,
                subtitle: parsed.subtitle
            }
        });

    } catch (err) {
        console.error("AI intro generation failed:", err.message);
        return res.status(500).json({
            message: "Failed to generate intro",
            error: err.message
        });
    }
};
