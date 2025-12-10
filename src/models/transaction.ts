import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Wallet } from "./wallet";

export enum TransactionType {
  DEPOSIT = "deposit",
  TRANSFER_IN = "transfer_in",
  TRANSFER_OUT = "transfer_out",
}

export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

@Entity("transactions")
export class Transaction {
  static map(arg0: (txn: { id: any; type: any; amount: { toString: () => string; }; status: any; reference: any; recipient_wallet_number: any; sender_wallet_number: any; created_at: any; }) => { id: any; type: any; amount: number; status: any; reference: any; recipient_wallet_number: any; sender_wallet_number: any; created_at: any; }) {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  wallet_id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: "wallet_id" })
  wallet: Wallet;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ unique: true, nullable: true })
  reference: string;

  @Column({ nullable: true })
  recipient_wallet_number: string;

  @Column({ nullable: true })
  sender_wallet_number: string;

  @CreateDateColumn()
  created_at: Date;
}