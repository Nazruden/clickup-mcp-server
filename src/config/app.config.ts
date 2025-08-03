import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

// Load environment variables from .env file
dotenv.config();

interface ServerConfig {
  port: number;
  logLevel: string;
}

// Remove ClickUpConfig for OAuth
// interface ClickUpConfig {
//   clientId: string;
//   clientSecret: string;
//   redirectUri: string;
//   apiUrl: string;
//   authUrl: string;
// }

interface Config {
  server: ServerConfig;
  // Remove clickUp property holding OAuth config
  // clickUp: ClickUpConfig;
  clickUpPersonalToken: string; // Add property for Personal API Token
  clickUpApiUrl: string; // Keep API URL separate
  encryptionKey: string; // Keep encryption key for potentially encrypting token at rest
}

// Removed unused generateEncryptionKey - handled within validateConfig now if needed
// function generateEncryptionKey(): string {
//   return crypto.randomBytes(32).toString("hex");
// }

function validateConfig(): Config {
  // Update required env vars
  const requiredEnvVars = ["CLICKUP_PERSONAL_TOKEN"];
  // const requiredEnvVars = ["CLICKUP_CLIENT_ID", "CLICKUP_CLIENT_SECRET"];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const logLevel = process.env.LOG_LEVEL || "info";

  // Remove dynamic redirect URI logic
  // const redirectUri =
  //   process.env.CLICKUP_REDIRECT_URI ||
  //   `http://localhost:${port}/oauth/clickup/callback`;

  // Get ClickUp Personal Token
  const clickUpPersonalToken = process.env.CLICKUP_PERSONAL_TOKEN!;

  // Get or Generate encryption key (still potentially useful for encrypting the token at rest)
  const encryptionKey =
    process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

  return {
    server: {
      port,
      logLevel,
    },
    // Remove clickUp object
    // clickUp: {
    //   clientId: process.env.CLICKUP_CLIENT_ID!,
    //   clientSecret: process.env.CLICKUP_CLIENT_SECRET!,
    //   redirectUri,
    //   apiUrl: "https://api.clickup.com/api/v2",
    //   authUrl: "https://app.clickup.com/api",
    // },
    clickUpPersonalToken, // Add token directly
    clickUpApiUrl: "https://api.clickup.com/api", // Base URL with /api path
    encryptionKey, // Keep encryption key
  };
}

export const config = validateConfig();
