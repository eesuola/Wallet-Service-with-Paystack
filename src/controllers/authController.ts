import { Request, Response } from "express";
import { generateToken } from "../utils/jwt";
import { User } from "../models/user";

export const googleCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return token
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};