import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { protect } from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "humanity_calls_email_banners",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      { width: 800, height: 400, crop: "fill", quality: "auto", fetch_format: "auto" }
    ],
  },
});

const upload = multer({ storage: storage });

// @route   POST /api/email/upload-banner
router.post("/upload-banner", protect, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({
    message: "Banner uploaded successfully",
    imageUrl: req.file.path,
  });
});

export default router;
