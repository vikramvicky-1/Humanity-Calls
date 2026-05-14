import rateLimit from "express-rate-limit";
import EmergencyEngagementEvent from "../models/EmergencyEngagementEvent.js";
import EmergencyFundraiser from "../models/EmergencyFundraiser.js";
import EmergencyDonation from "../models/EmergencyDonation.js";
import moment from "moment";

export const emergencyEventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { message: "Too many analytics events. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const ALLOWED_TYPES = new Set([
  "list_view",
  "list_card_open",
  "detail_view",
  "fab_click",
  "home_section_view",
  "popup_impression",
  "share_whatsapp",
  "share_twitter",
  "share_facebook",
  "share_telegram",
  "copy_link",
  "download_banner",
  "donate_form_open",
  "donation_submit",
  "qr_section_view",
]);

export const postEmergencyEvent = async (req, res) => {
  try {
    const { slug = "", eventType } = req.body || {};
    if (!eventType || !ALLOWED_TYPES.has(String(eventType))) {
      return res.status(400).json({ message: "Invalid event type" });
    }
    let fundraiserId = null;
    if (slug && String(slug).trim()) {
      const fr = await EmergencyFundraiser.findOne({ slug: String(slug).trim() }).select("_id").lean();
      if (fr) fundraiserId = fr._id;
    }
    await EmergencyEngagementEvent.create({
      slug: slug ? String(slug).trim() : "",
      fundraiserId,
      eventType: String(eventType),
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to record event" });
  }
};

export const getEmergencyFundAnalytics = async (req, res) => {
  try {
    const { range } = req.query;
    let startDate;
    if (range === "7d") {
      startDate = moment().subtract(7, "days").startOf("day").toDate();
    } else if (range === "30d") {
      startDate = moment().subtract(30, "days").startOf("day").toDate();
    } else {
      startDate = new Date(0);
    }

    const [byType, donationsAgg] = await Promise.all([
      EmergencyEngagementEvent.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
      EmergencyDonation.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "approved" } },
        {
          $group: {
            _id: "$fundraiserId",
            donationCount: { $sum: 1 },
            donationAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const events = {};
    byType.forEach((row) => {
      events[row._id] = row.count;
    });

    const totalApprovedDonations = donationsAgg.reduce((s, r) => s + r.donationCount, 0);
    const totalApprovedAmount = donationsAgg.reduce((s, r) => s + r.donationAmount, 0);

    res.status(200).json({
      events,
      donations: {
        approvedCount: totalApprovedDonations,
        approvedAmount: totalApprovedAmount,
        byFundraiser: donationsAgg.map((r) => ({
          fundraiserId: r._id,
          count: r.donationCount,
          amount: r.donationAmount,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load emergency analytics" });
  }
};
