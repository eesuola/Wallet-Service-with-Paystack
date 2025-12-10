import { Request, Response } from "express";
import { connectDB } from "../config/db";
import { Wallet } from "../models/wallet";
import { Transaction, TransactionType, TransactionStatus } from "../models/transaction";
import { User } from "../models/user";
import { initializePayment, verifyPayment } from "../services/paystackService";
import crypto from "crypto";

export const getWalletBalance = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const userId = user.id;

    const walletRepository = connectDB.getRepository(Wallet);
    const wallet = await walletRepository.findOne({
      where: { user_id: userId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.json({
      balance: parseFloat(wallet.balance.toString()),
      wallet_number: wallet.wallet_number,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const userId = user.id;

    const walletRepository = connectDB.getRepository(Wallet);
    const wallet = await walletRepository.findOne({
      where: { user_id: userId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const transactionRepository = connectDB.getRepository(Transaction);
    const transactions = await transactionRepository.find({
      where: { wallet_id: wallet.id },
      order: { created_at: "DESC" },
    });

    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id,
      type: txn.type,
      amount: parseFloat(txn.amount.toString()),
      status: txn.status,
      reference: txn.reference,
      recipient_wallet_number: txn.recipient_wallet_number,
      sender_wallet_number: txn.sender_wallet_number,
      created_at: txn.created_at,
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const initiateDeposit = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const walletRepository = connectDB.getRepository(Wallet);
    const wallet = await walletRepository.findOne({
      where: { user_id: user.id },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    
    const reference = `dep_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

   
    const transactionRepository = connectDB.getRepository(Transaction);
    const transaction = transactionRepository.create({
      wallet_id: wallet.id,
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.PENDING,
      reference,
    });
    await transactionRepository.save(transaction);

   
    const paystackResponse = await initializePayment(
      user.email,
      amount,
      reference
    );

    res.json({
      reference,
      authorization_url: paystackResponse.data.authorization_url,
    });
  } catch (error) {
    console.error("Initiate deposit error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getDepositStatus = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const transactionRepository = connectDB.getRepository(Transaction);
    const transaction = await transactionRepository.findOne({
      where: { reference },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const paystackResponse = await verifyPayment(reference);

    res.json({
      reference: transaction.reference,
      status: transaction.status,
      amount: parseFloat(transaction.amount.toString()),
      paystack_status: paystackResponse.data.status,
    });
  } catch (error) {
    console.error("Get deposit status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const transferFunds = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { wallet_number, amount } = req.body;

    if (!wallet_number || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid wallet number or amount" });
    }

    const walletRepository = connectDB.getRepository(Wallet);
    const transactionRepository = connectDB.getRepository(Transaction);

    
    const senderWallet = await walletRepository.findOne({
      where: { user_id: user.id },
    });

    if (!senderWallet) {
      return res.status(404).json({ error: "Sender wallet not found" });
    }

    
    const senderBalance = parseFloat(senderWallet.balance.toString());
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    
    const recipientWallet = await walletRepository.findOne({
      where: { wallet_number },
    });

    if (!recipientWallet) {
      return res.status(404).json({ error: "Recipient wallet not found" });
    }

    
    if (senderWallet.id === recipientWallet.id) {
      return res.status(400).json({ error: "Cannot transfer to your own wallet" });
    }

    
    await connectDB.transaction(async (transactionalEntityManager) => {
      
      senderWallet.balance = senderBalance - amount;
      await transactionalEntityManager.save(senderWallet);

      
      const recipientBalance = parseFloat(recipientWallet.balance.toString());
      recipientWallet.balance = recipientBalance + amount;
      await transactionalEntityManager.save(recipientWallet);

      
      const transferOutTxn = transactionRepository.create({
        wallet_id: senderWallet.id,
        type: TransactionType.TRANSFER_OUT,
        amount,
        status: TransactionStatus.SUCCESS,
        recipient_wallet_number: wallet_number,
        reference: `trx_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      });
      await transactionalEntityManager.save(transferOutTxn);

      
      const transferInTxn = transactionRepository.create({
        wallet_id: recipientWallet.id,
        type: TransactionType.TRANSFER_IN,
        amount,
        status: TransactionStatus.SUCCESS,
        sender_wallet_number: senderWallet.wallet_number,
        reference: `trx_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      });
      await transactionalEntityManager.save(transferInTxn);
    });

    res.json({
      status: "success",
      message: "Transfer completed",
    });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ error: "Server error" });
  }
};