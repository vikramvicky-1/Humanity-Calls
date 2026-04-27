import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { listPublicSubmissions } from "../controllers/publicSubmissionAdminController.js";

const router = express.Router();

router.get("/", protect, adminOnly, listPublicSubmissions);

export default router;

