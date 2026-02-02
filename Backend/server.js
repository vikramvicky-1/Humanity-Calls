import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import emailRoutes from "./routes/emailRoutes.js";
import authRoutes from "./routes/auth.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import { initAdmin } from "./controllers/authController.js";

dotenv.config();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "https://www.humanitycalls.org",
      "https://humanitycalls.org",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Database Connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    initAdmin();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api", emailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
