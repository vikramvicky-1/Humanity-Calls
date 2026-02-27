import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Only one active OTP per email
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document will be automatically deleted after 10 minutes (600 seconds)
  },
});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
