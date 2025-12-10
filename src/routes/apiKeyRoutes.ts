import express from "express";
import { JWT_TOKEN } from "../middleware/auth";
import { createApiKey, rolloverApiKey } from "../controllers/apiKeyController";

const router = express.Router();

// Create API key
router.post("/create", JWT_TOKEN, createApiKey);

// Rollover expired API key
router.post("/rollover", JWT_TOKEN, rolloverApiKey);

export default router;