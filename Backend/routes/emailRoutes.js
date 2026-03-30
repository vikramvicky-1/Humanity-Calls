import express from "express";
import { sendEmail, sendPublicDonationEmail, sendMassEmail, getMassMailHistory, getAllPotentialRecipients } from "../controllers/emailController.js";
import { checkAndSendBirthdayEmails } from "../utils/birthdayCron.js";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Admin Mass Emailing
router.post("/send-mass-email", protect, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}, sendMassEmail);

router.get("/mass-mail-history", protect, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}, getMassMailHistory);

router.get("/all-potential-recipients", protect, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}, getAllPotentialRecipients);

// Rate limiting: 1 request per 30 seconds per IP
const contactEmailLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1, // Limit each IP to 1 request per windowMs
  message: {
    message: "Too many requests, please try again after 30 seconds.",
    retryAfter: 30
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/send-email", protect, contactEmailLimiter, sendEmail);

// Public donation submit (no login required)
router.post("/public-donation", contactEmailLimiter, sendPublicDonationEmail);

// Test route to manually trigger birthday checks (Only for admin or internal use)
router.get("/test-birthday-emails", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    await checkAndSendBirthdayEmails();
    res.json({ message: "Birthday check triggered successfully. Check logs for details." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
