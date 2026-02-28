import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update all users who don't have isSubscribedForMail explicitly set to false
    const subscriptionResult = await User.updateMany(
      { isSubscribedForMail: { $ne: false } },
      { $set: { isSubscribedForMail: true } }
    );

    // Update all existing users to be unverified by default
    const verificationResult = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: false } }
    );

    console.log(`Migration completed. Subscriptions configured: ${subscriptionResult.modifiedCount}, Verification set: ${verificationResult.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateUsers();
