import { Request, Response, NextFunction } from "express";
import { connectDB } from "../config/db";
import { ApiKey } from "../models/apiKeys";
import { hashApiKey } from "../utils/apiKey";

export async function ApiKeyToken(
  req: Request,
  res: Response,
  next: NextFunction,
  requiredPermission?: string
): Promise<void> {
  try {
    const apiKeyHeader = req.headers["x-api-key"] as string;

    if (!apiKeyHeader) {
      res.status(401).json({ error: "No API key provided" });
      return;
    }

    const keyHash = hashApiKey(apiKeyHeader);

    const apiKeyRepository = connectDB.getRepository(ApiKey);
    const apiKey = await apiKeyRepository.findOne({
      where: { key_hash: keyHash, is_active: true },
      relations: ["user"],
    });

    if (!apiKey) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }


    if (apiKey.expires_at < new Date()) {
      res.status(401).json({ error: "API key has expired" });
      return;
    }

   
    if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
      res.status(403).json({ error: `Missing permission: ${requiredPermission}` });
      return;
    }

    
    req.user = apiKey.user;
    next();
  } catch (error) {
    console.error("API key authentication error:", error);
    res.status(500).json({ error: "Server error" });
    return;
  }
}

// Middleware factories for deposit, transfer and read permissions
export const requireApiKeyWithDeposit = (req: Request, res: Response, next: NextFunction) =>
  ApiKeyToken(req, res, next, "deposit");

export const requireApiKeyWithTransfer = (req: Request, res: Response, next: NextFunction) =>
  ApiKeyToken(req, res, next, "transfer");

export const requireApiKeyWithRead = (req: Request, res: Response, next: NextFunction) =>
  ApiKeyToken(req, res, next, "read");