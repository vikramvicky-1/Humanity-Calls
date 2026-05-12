import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import rateLimit from "express-rate-limit";
import { submitPublicBloodDonation } from "../controllers/publicFormController.js";
import { uploadFileOnly } from "../controllers/galleryController.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "humanity_calls_public_forms",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/** Payment proof: image or PDF for emergency donations (memory → Cloudinary). */
const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const m = String(file.mimetype || "").toLowerCase();
    const name = String(file.originalname || "").toLowerCase();
    const ok =
      /^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(m) ||
      m === "application/pdf" ||
      (m === "application/octet-stream" && name.endsWith(".pdf"));
    if (ok) cb(null, true);
    else cb(new Error("Use JPG, PNG, WebP, HEIC, or PDF (max 8MB)."));
  },
});

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many submissions, please retry shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/blood-donation", submitLimiter, submitPublicBloodDonation);
router.post("/upload-image", submitLimiter, upload.single("image"), uploadFileOnly);

router.post(
  "/upload-proof",
  submitLimiter,
  (req, res, next) => {
    proofUpload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Invalid file" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: "humanity_calls_emergency_proofs",
        resource_type: "auto",
      });
      res.status(200).json({
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        success: true,
      });
    } catch (e) {
      console.error("upload-proof:", e);
      res.status(500).json({ message: e.message || "Upload failed" });
    }
  },
);

export default router;
