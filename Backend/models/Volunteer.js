import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  volunteerId: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Prefer not to say"],
    required: true,
  },
  interest: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  occupationDetail: {
    type: String,
  },
  skills: {
    type: String,
    required: true,
  },
  timeCommitment: {
    type: [String],
    required: true,
  },
  workingMode: {
    type: [String],
    required: true,
  },
  rolePreference: {
    type: [String],
    required: true,
  },
  govIdType: {
    type: String,
    enum: ["Aadhar Card", "Voter ID", "PAN Card", "Passport", "Other"],
    required: true,
  },
  govIdImage: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "rejected", "banned"],
    default: "pending",
  },
  termsAccepted: {
    type: Boolean,
    required: true,
  },
  rejectionReason: {
    type: String,
  },
  banReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;
