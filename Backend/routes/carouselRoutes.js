import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { protect } from "../middleware/auth.js";
import {
  getCarousel,
  uploadCarouselImage,
  deleteCarouselImage,
  reorderCarousel,
  updateCarouselImage,
} from "../controllers/carouselController.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Cloudinary configuration (Reuse from gallery but different folder)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "humanity_calls_carousel",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
    // Carousel images are large, but we don't apply watermarks here as per usual homepage aesthetics
    transformation: [
      { width: 1920, height: 1080, crop: "fill", quality: "auto", fetch_format: "auto" },
    ],
  },
});

const upload = multer({ storage: storage });

// @route   GET /api/carousel
router.get("/", getCarousel);

// @route   POST /api/carousel/upload
router.post("/upload", protect, upload.single("image"), uploadCarouselImage);

// @route   DELETE /api/carousel/:id
router.delete("/:id", protect, deleteCarouselImage);

// @route   PUT /api/carousel/:id
router.put("/id/:id", protect, updateCarouselImage);

// @route   PUT /api/carousel/reorder
router.put("/reorder", protect, reorderCarousel);

export default router;
