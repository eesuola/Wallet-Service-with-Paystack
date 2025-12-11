import { DataSource } from "typeorm";
import { User } from "../models/user";
import { Wallet } from "../models/wallet";
import { Transaction } from "../models/transaction";
import { ApiKey } from "../models/apiKeys";
import dotenv from "dotenv";

const isProduction = process.env.NODE_ENV === "production";

dotenv.config();

let dbConfig: any = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || ""),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
};
if (process.env.DATABASE_URL) {
  dbConfig = {
    ...dbConfig,
    url: process.env.DATABASE_URL,
  };
}

export const connectDB = new DataSource({
  ...dbConfig,
  synchronize: !isProduction,
  logging: !isProduction,
  entities: [User, Wallet, Transaction, ApiKey],
  migrations: [],
  subscribers: [],
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
