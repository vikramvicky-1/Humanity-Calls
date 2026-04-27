import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createFormSubmission,
  deleteFormSubmission,
  listFormSubmissions,
} from "../controllers/formSubmissionController.js";

const router = express.Router();

router.post("/:kind", protect, createFormSubmission);
router.get("/", protect, adminOnly, listFormSubmissions);
router.delete("/:id", protect, adminOnly, deleteFormSubmission);

export default router;

