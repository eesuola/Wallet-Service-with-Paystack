import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { connectDB } from "./db";
import { User } from "../models/user";
import { Wallet } from "../models/wallet";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userRepository = connectDB.getRepository(User);
        const walletRepository = connectDB.getRepository(Wallet);

        let user = await userRepository.findOne({
          where: { google_id: profile.id },
        });

        if (!user) {
         
          user = userRepository.create({
            email: profile.emails?.[0]?.value || "",
            google_id: profile.id,
            name: profile.displayName,
          });
          await userRepository.save(user);

        
          const walletNumber = generateWalletNumber();
          const wallet = walletRepository.create({
            user_id: user.id,
            wallet_number: walletNumber,
            balance: 0,
          });
          await walletRepository.save(wallet);
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);


passport.serializeUser((user: any, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepository = connectDB.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


function generateWalletNumber(): string {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
}

export default passport;