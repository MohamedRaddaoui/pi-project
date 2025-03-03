const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // Your backend API URL
    specPattern: "tests/e2e/**/*.cy.{js,jsx,ts,tsx}",
    screenshotOnRunFailure: true,
    supportFile: false,
  },
});
