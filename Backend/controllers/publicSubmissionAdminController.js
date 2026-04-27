import PublicSubmission from "../models/PublicSubmission.js";

export const listPublicSubmissions = async (req, res) => {
  try {
    const { kind } = req.query;
    const filter = {};
    if (kind) filter.kind = kind;

    const items = await PublicSubmission.find(filter).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch public submissions", error: error.message });
  }
};

