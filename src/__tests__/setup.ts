const dotenv = require("dotenv");
const path = require("path");

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, "../../.env.test"),
});

// Set up test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.CLICKUP_PERSONAL_TOKEN = "test_token_for_unit_tests";
process.env.ENCRYPTION_KEY = "test-encryption-key-32-chars-long-key";

// Global error handler for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});
