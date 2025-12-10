import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user";

@Entity("api_keys")
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.api_keys)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ unique: true })
  key_hash: string;

  @Column()
  name: string;

  @Column("simple-array") // Stores as comma-separated: "deposit,transfer,read"
  permissions: string[];

  @Column()
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}