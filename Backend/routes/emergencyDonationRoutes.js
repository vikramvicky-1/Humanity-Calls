import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  submitEmergencyDonation,
  listEmergencyDonations,
  updateEmergencyDonationStatus,
  getPendingEmergencyDonationsCount,
  getPendingCountsByFundraiser
} from "../controllers/emergencyDonationController.js";

const router = express.Router();

// Public
router.post("/submit", submitEmergencyDonation);

// Admin
router.get("/", protect, adminOnly, listEmergencyDonations);
router.get("/pending-count", protect, adminOnly, getPendingEmergencyDonationsCount);
router.get("/pending-counts-grouped", protect, adminOnly, getPendingCountsByFundraiser);
router.patch("/:id/status", protect, adminOnly, updateEmergencyDonationStatus);

export default router;
