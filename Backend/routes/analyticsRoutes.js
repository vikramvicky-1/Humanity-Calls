import express from "express";
import { getDashboardStats, getGraphData } from "../controllers/analyticsController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/graph", protect, adminOnly, getGraphData);

export default router;
