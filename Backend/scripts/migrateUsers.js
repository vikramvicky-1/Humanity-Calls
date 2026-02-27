import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update all users who don't have isSubscribedForMail explicitly set to false
    const result = await User.updateMany(
      { isSubscribedForMail: { $ne: false } },
      { $set: { isSubscribedForMail: true } }
    );

    console.log(`Migration completed successfully. Modified ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateUsers();
