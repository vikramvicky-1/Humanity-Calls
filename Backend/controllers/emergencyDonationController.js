import EmergencyDonation from "../models/EmergencyDonation.js";
import EmergencyFundraiser from "../models/EmergencyFundraiser.js";

// Public: Submit a donation
export const submitEmergencyDonation = async (req, res) => {
  try {
    const { fundraiserId, name, email, phone, amount, transactionId, screenshotUrl } = req.body;

    if (!fundraiserId || !name || !email || !phone || !amount || !transactionId || !screenshotUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const fundraiser = await EmergencyFundraiser.findById(fundraiserId);
    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found" });
    }

    const donation = await EmergencyDonation.create({
      fundraiserId,
      name,
      email,
      phone,
      amount,
      transactionId,
      screenshotUrl,
    });

    res.status(201).json({ message: "Donation submitted successfully", donation });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Transaction ID already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin: List all emergency donations with filter
export const listEmergencyDonations = async (req, res) => {
  try {
    const { fundraiserId, status } = req.query;
    const query = {};
    if (fundraiserId) query.fundraiserId = fundraiserId;
    if (status) query.status = status;

    const donations = await EmergencyDonation.find(query)
      .populate("fundraiserId", "title slug")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update donation status
export const updateEmergencyDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    const donation = await EmergencyDonation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const oldStatus = donation.status;
    donation.status = status;
    if (adminComment !== undefined) donation.adminComment = adminComment;
    await donation.save();

    // If status changed TO approved, update fundraiser
    if (oldStatus !== "approved" && status === "approved") {
      await EmergencyFundraiser.findByIdAndUpdate(donation.fundraiserId, {
        $inc: {
          raisedAmount: donation.amount,
          supportersCount: 1,
        },
      });
    }
    // If status changed FROM approved to something else, revert fundraiser
    else if (oldStatus === "approved" && status !== "approved") {
      await EmergencyFundraiser.findByIdAndUpdate(donation.fundraiserId, {
        $inc: {
          raisedAmount: -donation.amount,
          supportersCount: -1,
        },
      });
    }

    res.json({ message: `Donation ${status}`, donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get pending count for all or specific fundraiser
export const getPendingEmergencyDonationsCount = async (req, res) => {
  try {
    const { fundraiserId } = req.query;
    const query = { status: "pending" };
    if (fundraiserId) query.fundraiserId = fundraiserId;

    const count = await EmergencyDonation.countDocuments(query);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get pending counts grouped by fundraiser
export const getPendingCountsByFundraiser = async (req, res) => {
  try {
    const counts = await EmergencyDonation.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: "$fundraiserId", count: { $sum: 1 } } }
    ]);
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
