const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "your-default-uri";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully"); // eslint-disable-line no-console
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err); // eslint-disable-line no-console
    process.exit(1); // Exit on failure
  }
};

module.exports = connectDB;
