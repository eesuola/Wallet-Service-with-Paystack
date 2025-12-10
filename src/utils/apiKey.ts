import crypto from "crypto";

export function generateApiKey(): string {
  return `sk_live_${crypto.randomBytes(32).toString("hex")}`;
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function parseExpiry(expiry: string): Date {
  const now = new Date();
  
  switch (expiry) {
    case "1H":
      return new Date(now.getTime() + 60 * 60 * 1000); // One hour here
    case "1D":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // One day here
    case "1M":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // A month here
    case "1Y":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // One year here
    default:
      throw new Error("Invalid expiry format. Use 1H, 1D, 1M, or 1Y");
  }
}