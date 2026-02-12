import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  applyVolunteer,
  getMyVolunteerStatus,
  getVolunteers,
  updateVolunteerStatus,
  updateVolunteer,
  deleteVolunteer,
} from "../controllers/volunteerController.js";
import { uploadFileOnly } from "../controllers/galleryController.js";
import { protect, adminOnly } from "../middleware/auth.js";
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
    folder: "humanity_calls_volunteers",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

router.post("/apply", protect, applyVolunteer);
router.get("/my-status", protect, getMyVolunteerStatus);
router.post("/upload", protect, upload.single("image"), uploadFileOnly);
router.get("/", protect, adminOnly, getVolunteers);
router.put("/status/:id", protect, adminOnly, updateVolunteerStatus);
router.put("/:id", protect, adminOnly, updateVolunteer);
router.delete("/:id", protect, adminOnly, deleteVolunteer);

export default router;
