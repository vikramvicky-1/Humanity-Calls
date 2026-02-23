import express from "express";
import {
  downloadIdCard,
  verifyVolunteer,
} from "../controllers/idCardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * Download ID Card
 * GET /api/id-card/download/:id
 */
router.get("/download/:id", protect, downloadIdCard);

/**
 * QR Verification Route
 * GET /api/id-card/verify/:volunteerId
 */
router.get("/verify/:volunteerId", verifyVolunteer);

export default router;
