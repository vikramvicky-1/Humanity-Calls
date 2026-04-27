import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { getTeamTree, updateTeamAssignment } from "../controllers/teamController.js";

const router = express.Router();

// Public read-only team tree
router.get("/tree", getTeamTree);

// Admin update
router.put("/user/:id", protect, adminOnly, updateTeamAssignment);

export default router;

