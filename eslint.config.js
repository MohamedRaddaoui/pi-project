// eslint.config.js
export default [
  {
    ignores: ["node_modules/", "dist/", "coverage/"], // Ignore unnecessary files
  },
  {
    files: ["**/*.js", "**/*.ts"], // Apply ESLint to JavaScript and TypeScript files
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript version
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      semi: ["error", "always"], // Enforce semicolons
      quotes: ["error", "double"], // Enforce double quotes
    },
  },
];
