const Sentiment = require("sentiment");
const { google } = require("googleapis");
const sentiment = new Sentiment();
const axios = require("axios").default;

class SentimentService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = "1y_3di0Y-FnQzDHGTu5bmucNGRLJ5MkBESoeY-xfgiic";
  }

  async initializeGoogleSheets() {
    try {
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return;
      }

      this.auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });

      this.sheets = google.sheets({ version: "v4", auth: this.auth });
    } catch (error) {
      this._logError("Google Sheets initialization error:", error);
    }
  }

  _logError(message, error) {
    if (process.env.NODE_ENV !== "test") {
      const logger = require("winston") || console;
      logger.error(message, { error: error?.message || error });
    }
  }

  analyzeSentiment(text) {
    const result = sentiment.analyze(text);
    return {
      score: result.score,
      comparative: result.comparative,
      tokens: result.tokens,
      positive: result.positive,
      negative: result.negative
    };
  }

  async updateGoogleSheet(questions) {
    const headers = [
      "Question Title",
      "Content",
      "Frequency",
      "Sentiment Score",
      "Comparative Score",
      "Views",
      "Vote Score",
      "Created At"
    ];

    const rows = questions.map(q => ({
      title: q.title || "",
      content: q.content || "",
      frequency: q.frequency || 0,
      sentimentScore: q.sentiment?.score || 0,
      comparative: q.sentiment?.comparative || 0,
      views: q.views || 0,
      voteScore: q.voteScore || 0,
      createdAt: q.createdAt?.toISOString() || new Date().toISOString()
    }));

    const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyC26Osovor8xsm1AhNWy_ZEpeaQwttq7FqEVAlWwWI2ZTRJDyEDhenex1oZpJetaO-/exec";

    try {
      const response = await axios.post(googleAppsScriptUrl, { rows });

      return {
        spreadsheetId: this.spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`,
        headers: headers,
        data: rows,
        googleAppsScriptResponse: response.data
      };
    } catch (error) {
      this._logError("Failed to update Google Sheet via Apps Script", error);
      return {
        spreadsheetId: this.spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`,
        headers: headers,
        data: rows,
        error: error.message || "Failed to update Google Sheet via Apps Script"
      };
    }
  }

  async getSimilarQuestions(text, threshold = 0.7) {
    const normalizedText = text.toLowerCase().trim();
    return async function(questions) {
      return questions.filter(q => {
        const similarity = this._calculateSimilarity(
          normalizedText,
          q.title.toLowerCase().trim()
        );
        return similarity >= threshold;
      });
    };
  }

  _calculateSimilarity(str1, str2) {
    const set1 = new Set(str1.split(" "));
    const set2 = new Set(str2.split(" "));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
}

module.exports = new SentimentService();