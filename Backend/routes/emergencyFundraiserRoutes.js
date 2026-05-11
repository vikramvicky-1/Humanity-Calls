import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createEmergencyFundraiser,
  listEmergencyFundraisersAdmin,
  listEmergencyFundraisersPublic,
  getPopupEmergencyFundraiser,
  getEmergencyFundraiserAdmin,
  getEmergencyFundraiserPublicBySlug,
  updateEmergencyFundraiser,
  deleteEmergencyFundraiser,
  toggleActive,
  togglePopup,
  toggleFeatured,
  uploadEmergencyAsset,
} from "../controllers/emergencyFundraiserController.js";
import dotenv from "dotenv";

dotenv.config();

/** Max video upload size (bytes). Default 5GB for long clips (~30 min depending on quality). Override with EMERGENCY_VIDEO_MAX_BYTES. */
const EMERGENCY_VIDEO_MAX_BYTES = Math.max(
  80 * 1024 * 1024,
  Number(process.env.EMERGENCY_VIDEO_MAX_BYTES) || 5 * 1024 * 1024 * 1024,
);

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extFromName = (name) => {
  const n = String(name || "").toLowerCase();
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i + 1) : "";
};

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "humanity_calls_emergency",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "heic", "heif", "avif"],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "humanity_calls_emergency_video",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "webm", "mkv"],
  },
});

const imageExtOk = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "avif"]);

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const ext = extFromName(file.originalname);
    if (mime === "image/svg+xml") {
      return cb(new Error("SVG images are not allowed"));
    }
    if (mime.startsWith("image/")) {
      return cb(null, true);
    }
    if ((!mime || mime === "application/octet-stream") && imageExtOk.has(ext)) {
      return cb(null, true);
    }
    cb(new Error("Only image files from your gallery are allowed (JPEG, PNG, WebP, HEIC)"));
  },
});

const videoExtOk = new Set(["mp4", "mov", "webm", "mkv", "m4v", "3gp", "mpeg", "mpg"]);

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: EMERGENCY_VIDEO_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const ext = extFromName(file.originalname);
    if (/^video\//i.test(mime)) {
      return cb(null, true);
    }
    if (videoExtOk.has(ext) && (!mime || mime === "application/octet-stream")) {
      return cb(null, true);
    }
    cb(new Error("Only video files are allowed (MP4, MOV, WebM, etc.)"));
  },
});

const runUpload = (upload) => (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
};

// Public
router.get("/public", listEmergencyFundraisersPublic);
router.get("/public/popup", getPopupEmergencyFundraiser);
router.get("/public/slug/:slug", getEmergencyFundraiserPublicBySlug);

// Admin uploads (before /:id routes)
router.post(
  "/upload/image",
  protect,
  adminOnly,
  runUpload(imageUpload),
  (req, res, next) => {
    req.params.kind = "image";
    uploadEmergencyAsset(req, res, next);
  },
);

router.post(
  "/upload/video",
  protect,
  adminOnly,
  runUpload(videoUpload),
  (req, res, next) => {
    req.params.kind = "video";
    uploadEmergencyAsset(req, res, next);
  },
);

// Admin CRUD
router.get("/", protect, adminOnly, listEmergencyFundraisersAdmin);
router.post("/", protect, adminOnly, createEmergencyFundraiser);
router.get("/:id", protect, adminOnly, getEmergencyFundraiserAdmin);
router.put("/:id", protect, adminOnly, updateEmergencyFundraiser);
router.delete("/:id", protect, adminOnly, deleteEmergencyFundraiser);
router.patch("/:id/toggle-active", protect, adminOnly, toggleActive);
router.patch("/:id/toggle-popup", protect, adminOnly, togglePopup);
router.patch("/:id/toggle-featured", protect, adminOnly, toggleFeatured);

export default router;
