import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createReimbursementRequest,
  listAllReimbursements,
  listMyReimbursements,
  updateReimbursementStatus,
} from "../controllers/reimbursementController.js";

const router = express.Router();

router.post("/", protect, createReimbursementRequest);
router.get("/my", protect, listMyReimbursements);
router.get("/", protect, adminOnly, listAllReimbursements);
router.put("/:id/status", protect, adminOnly, updateReimbursementStatus);

export default router;

