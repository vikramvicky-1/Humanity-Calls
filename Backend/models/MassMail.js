import mongoose from "mongoose";

const massMailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  heading: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: String,
    default: "",
  },
  recipients: {
    type: [String],
    enum: ["active_volunteers", "temporary_volunteers", "users", "all", "individual_volunteers", "individual_users"],
    required: true,
  },
  sentCount: {
    type: Number,
    default: 0,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MassMail = mongoose.model("MassMail", massMailSchema);

export default MassMail;
