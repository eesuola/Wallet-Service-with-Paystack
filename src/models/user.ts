import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { Wallet } from "./wallet";
import { ApiKey } from "./apiKeys";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  google_id: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  api_keys: ApiKey[];
}