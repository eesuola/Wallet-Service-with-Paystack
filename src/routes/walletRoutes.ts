import express from "express";
import { logToTerminal } from "../middleware/terminalAuth";
import {
  getWalletBalance,
  getTransactionHistory,
  initiateDeposit,
  getDepositStatus,
  transferFunds,
} from "../controllers/walletController";

const router = express.Router();

// Get wallet balance
router.get("/balance", logToTerminal("read"), getWalletBalance);

// Get transaction history
router.get("/transactions", logToTerminal("read"), getTransactionHistory);

// Initiate deposit
router.post("/deposit", logToTerminal("deposit"), initiateDeposit);

// Get deposit status
router.get(
  "/deposit/:reference/status",
  logToTerminal("read"),
  getDepositStatus
);

// Transfer funds
router.post("/transfer", logToTerminal("transfer"), transferFunds);

export default router;
