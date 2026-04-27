import FormSubmission from "../models/FormSubmission.js";

const allowedKinds = new Set([
  "animal_rescue_request",
  "animal_adopt_now",
  "poor_request_help",
  "poor_help_now",
]);

export const createFormSubmission = async (req, res) => {
  try {
    const { kind } = req.params;
    if (!allowedKinds.has(kind)) {
      return res.status(400).json({ message: "Invalid form kind" });
    }
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const data = req.body || {};
    const doc = await FormSubmission.create({
      user: req.user.id,
      kind,
      data,
    });

    res.status(201).json({ message: "Submission saved", submission: doc });
  } catch (error) {
    res.status(500).json({ message: "Failed to save submission", error: error.message });
  }
};

export const listFormSubmissions = async (req, res) => {
  try {
    const { kind } = req.query;
    const filter = {};
    if (kind) {
      if (!allowedKinds.has(kind)) {
        return res.status(400).json({ message: "Invalid form kind" });
      }
      filter.kind = kind;
    }

    const submissions = await FormSubmission.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

export const deleteFormSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FormSubmission.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Submission not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete submission", error: error.message });
  }
};

