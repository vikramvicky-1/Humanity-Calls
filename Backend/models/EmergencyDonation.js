import mongoose from "mongoose";

const emergencyDonationSchema = new mongoose.Schema(
  {
    fundraiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyFundraiser",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    transactionId: { type: String, required: true, unique: true },
    screenshotUrl: { type: String, required: true },
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
