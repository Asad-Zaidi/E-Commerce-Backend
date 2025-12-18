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
            "gemini-2.0-flash-exp", // Latest experimental model
            "gemini-1.5-flash-latest", // Stable/Cost-effective
            "gemini-pro"    // Fallback
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
                    Generate a comprehensive SEO-optimized product description for:
                    Product: ${product.name}
                    Category: ${product.category}
                    Raw Details: ${product.description || 'No details provided'}

                    Requirements:
                    1. KEYWORD-RICH DESCRIPTION (First paragraph):
                       - Include relevant keywords naturally (product name, category, use cases)
                       - Write compelling copy that appeals to search engines and customers
                       - 40-60 words, engaging and unique
                    
                    2. FEATURE & SPECIFICATIONS (Second paragraph):
                       - Highlight 3-5 key features or technical specifications
                       - Be specific and concise
                       - Use natural language, not bullet points
                       - 60-80 words
                    
                    3. BENEFIT-FOCUSED CONTENT (Final paragraph):
                       - Explain what customers gain from using this product
                       - Address pain points and solutions
                       - Include a subtle call-to-action
                       - 60-80 words
                    
                    FORMATTING:
                    - Total: 170-200 words maximum
                    - Write as flowing paragraphs (no headers, no markdown, no bold)
                    - Tone: Professional, persuasive, and customer-centric
                    - Return ONLY the description text
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

    // Create comprehensive fallback with all three aspects
    const keywordRich = `${name} is a premium ${category || 'product'} designed to meet your needs. ${description ? description.substring(0, 80) : 'Experience exceptional quality and performance with this cutting-edge solution.'} Perfect for professionals and enthusiasts alike.`;
    
    const features = `This product features advanced technology, user-friendly design, and reliable performance. Built with quality materials and tested for durability, ${name} delivers consistent results every time.`;
    
    const benefits = `Get more done with ${name} while saving time and effort. Backed by excellent support and competitive pricing, this is the smart choice for your ${category || 'needs'}. Order today and experience the difference!`;

    const rawFallback = `${keywordRich} ${features} ${benefits}`;

    // 5. Fix: Smart truncation (don't cut words in half)
    const MAX_LENGTH = 500; // Increased to accommodate comprehensive description
    if (rawFallback.length <= MAX_LENGTH) return rawFallback;

    // Cut at the last space before the limit to avoid splitting words
    return rawFallback.substring(0, rawFallback.lastIndexOf(' ', MAX_LENGTH)) + '...';
}

async function generateMetaTags(product) {
    if (!product || !product.name) {
        console.warn("⚠️ Invalid product data for meta tags generation");
        return generateFallbackMetaTags(product || { name: 'Unknown Product' });
    }

    try {
        console.log('Generating meta tags for:', product.name);

        const modelsToTry = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash-latest",
            "gemini-pro"
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying Gemini model for meta tags: ${modelName}`);

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 400,
                    }
                });

                const prompt = `
                    Generate SEO meta tags for this product in JSON format:
                    
                    Product Name: ${product.name}
                    Category: ${product.category}
                    Description: ${product.description || 'No description'}

                    Generate ONLY a valid JSON object with these exact keys:
                    {
                        "metaTitle": "50-60 characters max, include product name and category",
                        "metaDescription": "150-160 characters max, compelling description with benefits",
                        "metaKeywords": "8-10 relevant keywords separated by commas, lowercase"
                    }

                    Requirements:
                    - Meta title must be under 60 characters
                    - Meta description must be 150-160 characters
                    - Keywords must be 8-10 items, comma-separated, lowercase, relevant to product
                    - Return ONLY valid JSON, no markdown, no explanations
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let text = response.text().trim();

                // Remove markdown code blocks if present
                text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

                const metaTags = JSON.parse(text);

                // Validate the response
                if (metaTags.metaTitle && metaTags.metaDescription && metaTags.metaKeywords) {
                    console.log(`✅ Successfully generated meta tags using ${modelName}`);
                    return metaTags;
                }

                throw new Error("Invalid meta tags structure");

            } catch (modelError) {
                console.warn(`⚠️ Model ${modelName} failed for meta tags:`, modelError.message);
                continue;
            }
        }

        console.log('⚠️ All models failed for meta tags, using fallback');
        return generateFallbackMetaTags(product);

    } catch (error) {
        console.error('❌ Error generating meta tags:', error);
        return generateFallbackMetaTags(product);
    }
}

function generateFallbackMetaTags(product) {
    const { name, category, description } = product;

    const metaTitle = `${name} - ${category || 'Premium Product'} | Buy Now`;
    const metaDescription = `Discover ${name} - ${description?.substring(0, 100) || 'Premium quality product'}. Order online today!`;
    const keywords = [
        name.toLowerCase(),
        category?.toLowerCase() || 'product',
        'buy online',
        'premium',
        'quality',
        'best price',
        'order now',
        'deals'
    ];

    return {
        metaTitle: metaTitle.substring(0, 60),
        metaDescription: metaDescription.substring(0, 160),
        metaKeywords: keywords.slice(0, 10).join(', ')
    };
}

// Generate a professional blog post using AI
async function generateBlogPost(topic, category) {
    try {
        console.log('Generating blog post for topic:', topic);

        const modelsToTry = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash-latest",
            "gemini-pro"
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying Gemini model: ${modelName}`);

                const model = genAI.getGenerativeModel({
                    model: modelName
                });

                const prompt = `
                    Generate a professional, informative blog post about: "${topic}"
                    
                    Category: ${category || 'General'}
                    
                    Requirements:
                    - Write a comprehensive blog post between 500-600 words
                    - Use a professional and engaging tone
                    - Include an introduction, main content with 3-4 key points, and conclusion
                    - Make it informative, educational, and valuable to readers
                    - Include actionable insights or tips
                    - Write in HTML format with proper paragraph tags <p>, headings <h2>, <h3>, and lists <ul>, <li> where appropriate
                    - NO markdown formatting (no ** or #)
                    - Start directly with content, no title heading at the beginning
                    - Focus on providing real value and expertise
                    - Make it SEO-friendly with natural keyword usage
                    
                    Please provide only the blog content in HTML format without any additional text or explanation.
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const blogContent = response.text().trim();

                console.log(`✅ Successfully generated blog post using ${modelName}`);
                
                // Generate a short excerpt (first 150-200 characters)
                const tempDiv = blogContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const excerpt = tempDiv.substring(0, 200).trim() + '...';

                // Generate some relevant tags based on topic
                const tags = generateTagsFromTopic(topic, category);

                return {
                    content: blogContent,
                    excerpt: excerpt,
                    tags: tags
                };

            } catch (modelError) {
                console.log(`❌ Model ${modelName} failed:`, modelError.message);
                lastError = modelError;
            }
        }

        throw lastError || new Error('All AI models failed');

    } catch (error) {
        console.error('❌ Error generating blog post:', error);
        throw new Error(`AI blog generation failed: ${error.message}`);
    }
}

// Helper function to generate tags from topic
function generateTagsFromTopic(topic, category) {
    const tags = [];
    
    // Add category as a tag
    if (category) {
        tags.push(category.toLowerCase());
    }
    
    // Extract key words from topic (simple approach)
    const words = topic.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    // Add up to 3 meaningful words as tags
    tags.push(...words.slice(0, 3));
    
    return [...new Set(tags)]; // Remove duplicates
}

module.exports = { generateSEODescription, generateMetaTags, generateBlogPost };