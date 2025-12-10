import "reflect-metadata";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import walletRoutes from "./routes/walletRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import apiKeyRoutes from "./routes/apiKeyRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

// Middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes);
app.use("/wallet", webhookRoutes);
app.use("/keys", apiKeyRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Wallet Service API" });
});

// Start DB
connectDB
  .initialize()
  .then(() => {
    console.log(" Database connected");

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(" Database connection failed:", error);
  });
