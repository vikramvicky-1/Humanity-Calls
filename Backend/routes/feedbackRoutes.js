import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Feedback from "../models/Feedback.js";
import { protect, adminOnly } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many feedback submissions. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const feedbackUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Too many uploads. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const feedbackMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const m = String(file.mimetype || "").toLowerCase();
    const name = String(file.originalname || "").toLowerCase();
    const ok =
      /^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(m) ||
      m === "application/pdf" ||
      (m === "application/octet-stream" &&
        (name.endsWith(".pdf") || /\.(jpg|jpeg|png|webp|heic)$/i.test(name)));
    if (ok) cb(null, true);
    else cb(new Error("Upload JPG, PNG, WebP, HEIC, or PDF (max 8MB)."));
  },
});

// Public: upload attachment for feedback form
router.post("/upload", feedbackUploadLimiter, (req, res, next) => {
  feedbackMemory.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "humanity_calls_feedback",
      resource_type: "auto",
    });
    res.status(200).json({ url: uploaded.secure_url });
  } catch (e) {
    console.error("Feedback upload:", e);
    res.status(500).json({ message: e.message || "Upload failed" });
  }
});

// Public: Submit feedback (no auth required)
router.post("/", feedbackLimiter, async (req, res) => {
  try {
    const { name, message, attachmentUrls } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required." });
    }

    let urls = [];
    if (Array.isArray(attachmentUrls)) {
      urls = attachmentUrls.map((u) => String(u || "").trim()).filter(Boolean).slice(0, 8);
    }

    const feedback = await Feedback.create({
      name: name.trim(),
      message: message.trim(),
      attachmentUrls: urls,
    });

    res.status(201).json({ message: "Feedback submitted successfully!", feedback });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ message: "Failed to submit feedback." });
  }
});

// Admin: Get all feedback
router.get("/", protect, adminOnly, async (_req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback." });
  }
});

// Admin: Update feedback status
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json({ message: `Feedback marked as ${status}`, feedback });
  } catch (error) {
    res.status(500).json({ message: "Failed to update feedback status." });
  }
});

// Admin: Delete feedback
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }
    res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete feedback." });
  }
});

export default router;
