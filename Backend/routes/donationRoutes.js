import express from "express";
import {
  createDonation,
  getDonations,
  getPublicDonations,
  updateDonationStatus,
  deleteDonation,
} from "../controllers/donationController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/", createDonation);
router.get("/public", getPublicDonations);

// Admin routes
router.get("/", protect, adminOnly, getDonations);
router.put("/:id/status", protect, adminOnly, updateDonationStatus);
router.delete("/:id", protect, adminOnly, deleteDonation);

export default router;
