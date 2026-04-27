import mongoose from "mongoose";

const reimbursementRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    spentOnDate: {
      type: Date,
      default: null,
    },
    receiptImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    adminComment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

const ReimbursementRequest = mongoose.model("ReimbursementRequest", reimbursementRequestSchema);
export default ReimbursementRequest;

