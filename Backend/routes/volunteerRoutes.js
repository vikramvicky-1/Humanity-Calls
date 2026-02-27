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
  updateMyProfilePicture,
  deleteVolunteer,
  getActiveVolunteerCount,
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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));
    
    const isMimeValid = allowedMimes.includes(file.mimetype.toLowerCase());
    const isExtValid = allowedExtensions.includes(fileExt);
    
    if (isMimeValid || isExtValid) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Please upload JPEG, PNG, or WebP images only."));
    }
  }
});

router.post("/apply", protect, applyVolunteer);
router.get("/my-status", protect, getMyVolunteerStatus);
router.patch("/my-profile-picture", protect, updateMyProfilePicture);
router.get("/count", getActiveVolunteerCount);
router.post("/upload", protect, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadFileOnly);
router.get("/", protect, adminOnly, getVolunteers);
router.put("/status/:id", protect, adminOnly, updateVolunteerStatus);
router.put("/:id", protect, adminOnly, updateVolunteer);
router.delete("/:id", protect, adminOnly, deleteVolunteer);

export default router;
