import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { protect } from "../middleware/auth.js";
import {
  getGallery,
  uploadImage,
  deleteImage,
  updateImage,
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
    // Apply transformations on upload: Limit size, and add text + logo watermarks
    transformation: [
      { width: 1000, height: 1000, crop: "limit", quality: "auto", fetch_format: "auto" },
      // Logo watermark (top right)
      // Note: for non-standard formats like avif or webp, Cloudinary requires the extension in the overlay ID
      // using syntax: folder:filename.ext or just filename.ext
      { 
        overlay: "humanity_calls_assets:watermark_logo_new.png", 
        gravity: "north_east", 
        x: 20, 
        y: 20, 
        width: 100, 
        opacity: 100 
      },
      // Text watermark (center)
      { 
        overlay: { font_family: "Arial", font_size: 40, font_weight: "bold", text: "Humanity Calls Trust®" }, 
        color: "#ffffff", 
        opacity: 60, 
        gravity: "center" 
      }
    ],
  },
});

const upload = multer({ storage: storage });

// @route   GET /api/gallery
router.get("/", getGallery);

// @route   POST /api/gallery/upload
router.post("/upload", protect, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({ message: "Upload failed", error: err.message || err });
    }
    next();
  });
}, uploadImage);

// @route   DELETE /api/gallery/:id
router.delete("/:id", protect, deleteImage);

// @route   PUT /api/gallery/:id
router.put("/:id", protect, updateImage);

export default router;
