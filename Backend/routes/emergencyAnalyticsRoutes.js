import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  postEmergencyEvent,
  getEmergencyFundAnalytics,
  emergencyEventLimiter,
} from "../controllers/emergencyAnalyticsController.js";

const router = express.Router();

router.post("/event", emergencyEventLimiter, postEmergencyEvent);
router.get("/summary", protect, adminOnly, getEmergencyFundAnalytics);

export default router;
