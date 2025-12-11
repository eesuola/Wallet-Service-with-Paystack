import { Request, Response } from "express";
import { connectDB } from "../config/db";
import { ApiKey } from "../models/apiKeys";
import { User } from "../models/user";
import { generateApiKey, hashApiKey, parseExpiry } from "../utils/apiKey";

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { name, permissions, expiry } = req.body;

    if (!name || !permissions || !expiry) {
      return res.status(400).json({ error: "All fieldd are required" });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: "must be an array" });
    }

    const validPermissions = ["deposit", "transfer", "read"];
    const invalidPermission = permissions.filter(
      (p) => !validPermissions.includes(p)
    );
    if (invalidPermission.length > 0) {
      return res.status(400).json({
        error: `Invalid permissions: ${invalidPermission.join(
          ", "
        )}. Valid: deposit, transfer, read`,
      });
    }

    // This check for 5 keys
    const apiKeyRepository = connectDB.getRepository(ApiKey);
    const activeKeysCount = await apiKeyRepository.count({
      where: { user_id: user.id, is_active: true },
    });

    if (activeKeysCount >= 5) {
      return res.status(400).json({ error: "you exceeded the maximum keys" });
    }

    let expiresAt: Date;
    try {
      expiresAt = parseExpiry(expiry);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    const newApiKey = apiKeyRepository.create({
      user_id: user.id,
      key_hash: keyHash,
      name,
      permissions,
      expires_at: expiresAt,
      is_active: true,
    });
    await apiKeyRepository.save(newApiKey);

    res.status(201).json({
      api_key: apiKey,
      id: newApiKey.id,
      name: newApiKey.name,
      permissions: newApiKey.permissions,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Create API key error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const rolloverApiKey = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { expired_key_id, expiry } = req.body;

    if (!expired_key_id || !expiry) {
      return res
        .status(400)
        .json({ error: "All items are required" });
    }

    const apiKeyRepository = connectDB.getRepository(ApiKey);

 
    const oldKey = await apiKeyRepository.findOne({
      where: { id: expired_key_id, user_id: user.id },
    });

    if (!oldKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    
    if (oldKey.expires_at > new Date()) {
      return res.status(400).json({ error: "API key is not expired yet" });
    }

    
    const activeKeysCount = await apiKeyRepository.count({
      where: { user_id: user.id, is_active: true },
    });

    if (activeKeysCount >= 5) {
      return res
        .status(400)
        .json({ error: "Maximum 5 active API keys allowed per user" });
    }

  
    let expiresAt: Date;
    try {
      expiresAt = parseExpiry(expiry);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

   
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

   
    const newApiKey = apiKeyRepository.create({
      user_id: user.id,
      key_hash: keyHash,
      name: `${oldKey.name} (Rolled over)`,
      permissions: oldKey.permissions,
      expires_at: expiresAt,
      is_active: true,
    });
    await apiKeyRepository.save(newApiKey);

    res.status(201).json({
      api_key: apiKey,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Rollover API key error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
