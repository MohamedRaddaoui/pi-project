import { listen } from "./app"; // Import app
const PORT = process.env.PORT || 3000;

const server = listen(PORT, () => {
  if (process.env.NODE_ENV !== "prod") {
    console.log(`🚀 Server running on http://localhost:${PORT}`); // eslint-disable-line no-console
  }
});

// Handle server shutdown gracefully
process.on("SIGINT", () => {
  server.close(() => {
    if (process.env.NODE_ENV !== "prod") {
      console.log("Server Closed."); // eslint-disable-line no-console
    }
    process.exit(0);
  });
});

export default server;
