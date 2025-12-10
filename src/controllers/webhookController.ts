import { Request, Response } from "express";
import crypto from "crypto";
import { connectDB } from "../config/db";
import { Transaction, TransactionStatus } from "../models/transaction";
import { Wallet } from "../models/wallet";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    //  Paystack signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    const paystackSignature = req.headers["x-paystack-signature"];

    if (hash !== paystackSignature) {
      console.error("Invalid Paystack signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;

    if (event.event !== "charge.success") {
      return res.json({ status: true });
    }

    const reference = event.data.reference;
    const amount = event.data.amount / 100;
    const status = event.data.status;

    console.log(
      `Webhook received: ${reference}, Amount: ${amount}, Status: ${status}`
    );

    const transactionRepository = connectDB.getRepository(Transaction);
    const transaction = await transactionRepository.findOne({
      where: { reference },
    });

    if (!transaction) {
      console.error(`Transaction not found: ${reference}`);
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Check if already gone through
    if (transaction.status === TransactionStatus.SUCCESS) {
      console.log(`Transaction already processed: ${reference}`);
      return res.json({ status: true });
    }

    if (status === "success") {
      await connectDB.transaction(async (transactionalEntityManager) => {
        transaction.status = TransactionStatus.SUCCESS;
        await transactionalEntityManager.save(transaction);

        const walletRepository =
          transactionalEntityManager.getRepository(Wallet);
        const wallet = await walletRepository.findOne({
          where: { id: transaction.wallet_id },
        });

        if (!wallet) {
          throw new Error("Wallet not found");
        }

        wallet.balance = parseFloat(wallet.balance.toString()) + amount;
        await walletRepository.save(wallet);

        console.log(
          `Wallet credited: ${wallet.wallet_number}, New balance: ${wallet.balance}`
        );
      });
    } else {
      transaction.status = TransactionStatus.FAILED;
      await transactionRepository.save(transaction);
    }

    res.json({ status: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
