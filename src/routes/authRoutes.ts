import express from "express";
import passport from "../config/passport";
import { googleCallback } from "../controllers/authController";

const router = express.Router();

// Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  googleCallback
);

// Failure route
router.get("/failure", (req, res) => {
  res.status(401).json({ error: "Authentication failed" });
});

export default router;