import mongoose from "mongoose";

const emergencyEngagementEventSchema = new mongoose.Schema(
  {
    slug: { type: String, trim: true, default: "" },
    fundraiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyFundraiser",
      default: null,
    },
    eventType: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

emergencyEngagementEventSchema.index({ createdAt: -1 });
emergencyEngagementEventSchema.index({ slug: 1, eventType: 1, createdAt: -1 });

const EmergencyEngagementEvent = mongoose.model("EmergencyEngagementEvent", emergencyEngagementEventSchema);
export default EmergencyEngagementEvent;
