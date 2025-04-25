const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const User = require("../models/user");

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Get authentication URL
function getAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "openid",
    "profile",
    "email",
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent", // Ensures refresh token is issued
  });
}

module.exports = {
  getAuthUrl,
  oauth2Client,
};
