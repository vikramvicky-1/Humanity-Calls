import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadLogo = async () => {
  try {
    const result = await cloudinary.uploader.upload(
      "../Frontend/public/android-chrome-192x192.png",
      {
        folder: "humanity_calls_assets",
        public_id: "watermark_logo_new",
        overwrite: true,
      }
    );
    console.log("Upload successful!");
    console.log("Public ID to use for overlay:", result.public_id);
    console.log("Secure URL:", result.secure_url);
    console.log("Format:", result.format);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

uploadLogo();
