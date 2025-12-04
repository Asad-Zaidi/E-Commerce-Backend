// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function generateSEODescription(product) {
//     try {
//         console.log('Generating SEO description for:', product.name);

//         // Try different models in order of preference - updated model names
//         const modelsToTry = [
//             "gemini-2.0-flash"
//         ];

//         let lastError = null;

//         for (const modelName of modelsToTry) {
//             try {
//                 console.log(`Trying Gemini model: ${modelName}`);

//                 const model = genAI.getGenerativeModel({
//                     model: modelName
//                 });

//                 const prompt = `
//                     Generate an SEO-optimized product description for the following product:

//                     Product Name: ${product.name}
//                     Category: ${product.category}
//                     Description: ${product.description || 'No description available'}

//                     Requirements:
//                     - Write an engaging, SEO-friendly description under 180 words
//                     - Include relevant keywords naturally
//                     - Highlight key benefits and features
//                     - End with a compelling call-to-action
//                     - Make it suitable for search engines and customers
//                     - Focus on the product's value proposition and unique selling points

//                     Please provide only the description text without any additional formatting or headers.
//                 `;

//                 const result = await model.generateContent(prompt);
//                 const response = await result.response;
//                 const seoDescription = response.text().trim();

//                 console.log(`✅ Successfully generated SEO description using ${modelName}`);
//                 return seoDescription;

//             } catch (modelError) {
//                 console.log(`❌ Model ${modelName} failed:`, modelError.message);
//                 lastError = modelError;
//                 continue; // Try next model
//             }
//         }

//         // If all models failed, use fallback
//         console.log('⚠️ All Gemini models failed, using fallback implementation');
//         return generateFallbackSEO(product);

//     } catch (error) {
//         console.error('❌ Error in generateSEODescription:', error);
//         return generateFallbackSEO(product);
//     }
// }

// function generateFallbackSEO(product) {
//     const { name, category, description } = product;

//     const fallbackDescription = `${name} - Discover the ultimate ${category} solution. ${description || 'Experience premium quality and exceptional performance.'} Choose ${name} today for reliable service and outstanding results. Get started now and elevate your experience!`;

//     return fallbackDescription.length > 180 ? fallbackDescription.substring(0, 177) + '...' : fallbackDescription;
// }

// module.exports = { generateSEODescription };


const { GoogleGenerativeAI } = require("@google/generative-ai");

// Check for API key immediately
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing from environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSEODescription(product) {
    // 1. Validation: specific check for product name
    if (!product || !product.name) {
        console.warn("⚠️ Invalid product data provided to SEO generator");
        return generateFallbackSEO(product || { name: 'Unknown Product' });
    }

    try {
        console.log('Generating SEO description for:', product.name);

        // 2. Optimization: Added stable models for redundancy
        const modelsToTry = [
            "gemini-2.0-flash", // Experimental/Fast
            "gemini-1.5-flash", // Stable/Cost-effective
            "gemini-1.5-pro"    // High quality fallback
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying Gemini model: ${modelName}`);

                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    // 3. Optimization: Control randomness and length
                    generationConfig: {
                        temperature: 0.7, 
                        maxOutputTokens: 250,
                    }
                });

                const prompt = `
                    Generate an SEO-optimized product description for:
                    Product: ${product.name}
                    Category: ${product.category}
                    Raw Details: ${product.description || 'No details provided'}

                    Requirements:
                    - Maximum 100 words (concise and punchy)
                    - Tone: Professional yet persuasive
                    - Focus on benefits, not just features
                    - No markdown, no bold text, no headers
                    - Return ONLY the raw text description
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const seoDescription = response.text().trim();

                // 4. Sanity Check: Ensure result isn't empty
                if (seoDescription.length > 10) {
                     console.log(`✅ Successfully generated via ${modelName}`);
                     return seoDescription;
                }
                
                throw new Error("Generated text was too short or empty");

            } catch (modelError) {
                console.warn(`⚠️ Model ${modelName} failed or returned invalid data:`, modelError.message);
                continue; 
            }
        }

        console.log('⚠️ All Gemini models failed, using fallback');
        return generateFallbackSEO(product);

    } catch (error) {
        console.error('❌ Critical Error in generateSEODescription:', error);
        return generateFallbackSEO(product);
    }
}

function generateFallbackSEO(product) {
    const { name, category, description } = product;
    
    // Create a safe, generic description
    const rawFallback = `${name} is the ultimate solution for your ${category || 'needs'}. ${description || 'Designed for performance and reliability.'} Experience premium quality with ${name} today.`;

    // 5. Fix: Smart truncation (don't cut words in half)
    const MAX_LENGTH = 300; // Aligned closer to "180 words" output roughly
    if (rawFallback.length <= MAX_LENGTH) return rawFallback;

    // Cut at the last space before the limit to avoid splitting words
    return rawFallback.substring(0, rawFallback.lastIndexOf(' ', MAX_LENGTH)) + '...';
}

module.exports = { generateSEODescription };