import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { protect } from "../middleware/auth.js";
import {
  getGallery,
  uploadImage,
  deleteImage,
} from "../controllers/galleryController.js";
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
    folder: "humanity_calls_gallery",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
    transformation: [
      { width: 1000, height: 1000, crop: "limit", quality: "auto", fetch_format: "auto" },
    ],
  },
});

const upload = multer({ storage: storage });

// @route   GET /api/gallery
router.get("/", getGallery);

// @route   POST /api/gallery/upload
router.post("/upload", protect, upload.single("image"), uploadImage);

// @route   DELETE /api/gallery/:id
router.delete("/:id", protect, deleteImage);

export default router;
