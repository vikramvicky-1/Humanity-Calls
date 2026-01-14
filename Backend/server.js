import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import emailRoutes from "./routes/emailRoutes.js";

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
  })
);
app.use(express.json());

// Routes
app.use("/api", emailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Contact backend running on port ${PORT}`);
});
