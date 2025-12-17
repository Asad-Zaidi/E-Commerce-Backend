const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
        console.error("MongoDB URI not found in environment variables!");
        process.exit(1);
    }
    await mongoose.connect(uri);
        console.log(`MongoDB Connected Successfully.`);

    // try {
    //     await mongoose.connect(uri);
    //     console.log(`MongoDB Connected Successfully.`);
    // } catch (error) {
    //     console.error(`Database Connection Error: ${error.message}`);
    // }
};

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
    connectDB();
});

module.exports = connectDB;
