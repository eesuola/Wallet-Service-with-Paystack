import { Request, Response, NextFunction } from "express";
import { JWT_TOKEN } from "./auth";
import { ApiKeyToken } from "./apiKey";

export function logToTerminal(requiredPermission?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers["x-api-key"];

    // Prefer JWT if both are present
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return JWT_TOKEN(req, res, next);
    }

    if (apiKeyHeader) {
      return ApiKeyToken(req, res, next, requiredPermission);
    }

    res.status(401).json({ error: "No authentication provided" });
  };
}