import express from "express";
import { handlePaystackWebhook } from "../controllers/webhookController";

const router = express.Router();

router.post("/paystack/webhook", handlePaystackWebhook);

export default router;
