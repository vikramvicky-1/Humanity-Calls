import express from "express";
import { sendEmail } from "../controllers/emailController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

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

router.post("/send-email", contactEmailLimiter, sendEmail);

export default router;
