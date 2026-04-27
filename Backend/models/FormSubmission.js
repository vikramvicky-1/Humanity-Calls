import mongoose from "mongoose";

const formSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kind: {
      type: String,
      enum: [
        "animal_rescue_request",
        "animal_adopt_now",
        "poor_request_help",
        "poor_help_now",
      ],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);
export default FormSubmission;

