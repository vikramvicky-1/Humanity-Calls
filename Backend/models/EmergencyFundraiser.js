import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    upiId: { type: String, default: "" },
  },
  { _id: false },
);

const contactDetailsSchema = new mongoose.Schema(
  {
    phone: { type: String, default: "" },
    alternatePhone: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false },
);

const emergencyFundraiserSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    shortDescription: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    patientName: { type: String, default: "" },
    hospitalName: { type: String, default: "" },
    medicalCondition: { type: String, default: "" },
    targetAmount: { type: Number, required: true, min: 1 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    photos: [{ type: String }],
    videoUrl: { type: String, default: "" },
    qrCodeImage: { type: String, default: "" },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
    contactDetails: { type: contactDetailsSchema, default: () => ({}) },
    shareLink: { type: String, default: "" },
    supportersCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    showPopup: { type: Boolean, default: false },
    bannerImage: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

emergencyFundraiserSchema.set("toJSON", { virtuals: true });
emergencyFundraiserSchema.set("toObject", { virtuals: true });

emergencyFundraiserSchema.virtual("pendingAmount").get(function () {
  const target = Number(this.targetAmount) || 0;
  const raised = Math.max(0, Number(this.raisedAmount) || 0);
  return Math.max(0, target - raised);
});

emergencyFundraiserSchema.virtual("progressPercentage").get(function () {
  const target = Number(this.targetAmount) || 0;
  if (target <= 0) return 0;
  const raised = Math.max(0, Number(this.raisedAmount) || 0);
  return Math.min(100, Math.round((raised / target) * 1000) / 10);
});

emergencyFundraiserSchema.virtual("goalReached").get(function () {
  const target = Number(this.targetAmount) || 0;
  const raised = Math.max(0, Number(this.raisedAmount) || 0);
  return target > 0 && raised >= target;
});

const EmergencyFundraiser = mongoose.model("EmergencyFundraiser", emergencyFundraiserSchema);
export default EmergencyFundraiser;
