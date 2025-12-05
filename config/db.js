// const mongoose = require("mongoose");

// const connectDB = async (retries = 5, delay = 5000) => {
//     const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

//     if (!uri) {
//         console.error("MongoDB URI not found in environment variables!");
//         process.exit(1);
//     }

//     try {
//         await mongoose.connect(uri);
//         console.log(`MongoDB Connected Successfully.`);
//     } catch (error) {
//         console.error(`Database Connection Error: ${error.message}`);
//     }
// };

// mongoose.connection.on("disconnected", () => {
//     console.warn("MongoDB disconnected. Attempting to reconnect...");
//     connectDB();
// });

// module.exports = connectDB;

// config/db.js
const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
    if (cached.conn) return cached.conn;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MongoDB URI is missing!");

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectDB;
