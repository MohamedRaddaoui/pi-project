const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1d' }, // Le token expirera automatiquement au bout de 24h
});

module.exports = mongoose.model("Blacklist", blacklistSchema);
