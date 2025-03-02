const app = require("./app"); // Import app
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle server shutdown gracefully
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

module.exports = server;
