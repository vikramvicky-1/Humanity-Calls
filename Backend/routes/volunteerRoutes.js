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
  verifyVolunteerId,
  getReferralStats,
  adminRemoveVolunteerProfilePicture,
  adminReplaceVolunteerProfilePicture,
  setManualReferral,
} from "../controllers/volunteerController.js";
import { uploadFileOnly } from "../controllers/galleryController.js";
import { protect, adminOnly, optionalProtect } from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Referral stats for admin
router.get("/referrals", protect, adminOnly, getReferralStats);

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
    allowed_formats: ["jpg", "png", "jpeg", "webp", "heic", "heif"],
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
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

router.post("/apply", optionalProtect, applyVolunteer);
router.get("/my-status", protect, getMyVolunteerStatus);
router.patch("/my-profile-picture", protect, updateMyProfilePicture);
router.get("/count/active", getActiveVolunteerCount);
router.get("/verify-id/:id", verifyVolunteerId);
router.post("/set-manual-referral", protect, setManualReferral);
router.post("/upload", optionalProtect, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadFileOnly);

const licenseMemory = multer({
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

router.post("/upload-license", optionalProtect, (req, res, next) => {
  licenseMemory.single("file")(req, res, (err) => {
    if (err) {
      console.error("License upload multer:", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "humanity_calls_volunteers/licenses",
      resource_type: "auto",
    });
    res.status(200).json({
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      success: true,
    });
  } catch (e) {
    console.error("License upload:", e);
    res.status(500).json({ message: e.message || "Upload failed" });
  }
});

router.get("/", protect, adminOnly, getVolunteers);
router.put("/status/:id", protect, adminOnly, updateVolunteerStatus);
router.delete("/:id/profile-picture", protect, adminOnly, adminRemoveVolunteerProfilePicture);
router.post(
  "/:id/profile-picture",
  protect,
  adminOnly,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err.message);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  adminReplaceVolunteerProfilePicture,
);
router.put("/:id", protect, adminOnly, updateVolunteer);
router.delete("/:id", protect, adminOnly, deleteVolunteer);

export default router;
