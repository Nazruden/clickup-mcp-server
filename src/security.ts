import crypto from "crypto";
import fs from "fs";
import path from "path";

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

class SecurityManager {
  private static instance: SecurityManager;
  private encryptionKey: Buffer;
  private keyFile: string;

  private constructor() {
    this.keyFile = path.join(__dirname, "../data/encryption.key");
    this.encryptionKey = this.loadOrGenerateKey();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private loadOrGenerateKey(): Buffer {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.keyFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Try to load existing key
      if (fs.existsSync(this.keyFile)) {
        return Buffer.from(fs.readFileSync(this.keyFile, "hex"));
      }

      // Generate new key if none exists
      const newKey = crypto.randomBytes(32);
      fs.writeFileSync(this.keyFile, newKey.toString("hex"));
      return newKey;
    } catch (error) {
      console.error("Failed to load or generate encryption key:", error);
      throw new Error("Could not initialize encryption key");
    }
  }

  public encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv,
    );

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Return iv:encrypted:authTag
    return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
  }

  public decrypt(text: string): string {
    const [ivHex, encrypted, authTagHex] = text.split(":");
    if (!ivHex || !encrypted || !authTagHex) {
      throw new Error("Invalid encrypted text format");
    }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "hex"),
      Buffer.from(ivHex, "hex"),
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

// Export singleton instance methods
export const encrypt = (text: string): string => {
  return SecurityManager.getInstance().encrypt(text);
};

export const decrypt = (text: string): string => {
  return SecurityManager.getInstance().decrypt(text);
};
