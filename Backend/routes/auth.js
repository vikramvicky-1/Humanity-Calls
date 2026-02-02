import express from "express";
import { signup, login, getMe, logout, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.put("/profile", protect, updateProfile);

export default router;
