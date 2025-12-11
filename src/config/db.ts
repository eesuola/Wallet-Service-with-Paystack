import { DataSource } from "typeorm";
import { User } from "../models/user";
import { Wallet } from "../models/wallet";
import { Transaction } from "../models/transaction";
import { ApiKey } from "../models/apiKeys";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || ""),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Wallet, Transaction, ApiKey],
  subscribers: [],
  migrations: [],
});
