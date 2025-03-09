const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb+srv://eventManager:cyaDnlwwgEgDpf5V@cluster0.keknjcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit on failure
  }
};

module.exports = connectDB;
