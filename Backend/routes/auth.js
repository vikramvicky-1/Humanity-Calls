import express from "express";
import { signup, login, getMe, logout, updateProfile, forgotPassword, resetPassword, sendOtp, verifyOtp } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.put("/profile", protect, updateProfile);

export default router;
