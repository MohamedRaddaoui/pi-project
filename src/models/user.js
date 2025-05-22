const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "active", // peut être "inactive" pour les comptes désactivés
  },
  twoFACode: {
    type: String, // Code temporaire pour la 2FA
  },
  twoFACodeExpires: {
    type: Date, // Date d'expiration du code 2FA
  },
  googleTokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    id_token: String,
    refresh_token_expires_in: Number,
    expiry_date: Number,
  },
});

module.exports = mongoose.model("User", userSchema);
