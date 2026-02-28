import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Otp from '../models/Otp.js';

dotenv.config({ path: '../.env' });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const otps = await Otp.find({});
  console.log("All OTPs in DB:", otps);
  process.exit(0);
};

run();
