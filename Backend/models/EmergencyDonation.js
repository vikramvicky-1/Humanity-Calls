import mongoose from "mongoose";

const emergencyDonationSchema = new mongoose.Schema(
  {
    fundraiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyFundraiser",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 1 },
    /** Optional; unique only when present (sparse index). */
    transactionId: { type: String, trim: true, unique: true, sparse: true },
    screenshotUrl: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComment: { type: String },
  },
  { timestamps: true }
);

const EmergencyDonation = mongoose.model("EmergencyDonation", emergencyDonationSchema);
export default EmergencyDonation;
