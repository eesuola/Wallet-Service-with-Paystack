import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./user";
import { Transaction } from "./transaction";

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  wallet_number: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ unique: true })
  user_id: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @CreateDateColumn()
  created_at: Date;
}