import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { triggerEmail } from "./emailController.js";

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert the OTP record (replaces old unverified OTPs for the same email)
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, verified: false, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send the email via Brevo
    const emailPayload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Humanity Calls",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      subject: "Your Humanity Calls Verification Code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #C62828; text-align: center;">Verify Your Email</h2>
          <p>Thank you for starting your registration with Humanity Calls.</p>
          <p>Please use the following 6-digit code to verify your email address. This code will expire in 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #020887; background-color: #f5f5f5; padding: 15px 30px; border-radius: 8px;">${otp}</span>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br>The Humanity Calls Team</p>
        </div>
      `,
    };

    await triggerEmail(emailPayload);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, acceptTerms, isSubscribedForMail } = req.body;

    if (!acceptTerms) {
      return res.status(400).json({ message: "You must accept terms and conditions" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Ensure OTP was verified
    const verifiedOtp = await Otp.findOne({ email: email.toLowerCase(), verified: true });
    if (!verifiedOtp) {
      return res.status(403).json({ message: "Email must be verified to sign up" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isSubscribedForMail: isSubscribedForMail !== undefined ? isSubscribedForMail : true,
    });

    await user.save();

    // Clean up verified OTP
    await Otp.deleteOne({ _id: verifiedOtp._id });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email, isSubscribedForMail: user.isSubscribedForMail },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const query = email ? { email } : { username };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      message: "Logged in successfully",
      user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, isSubscribedForMail: user.isSubscribedForMail },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get Me
export const getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, isSubscribedForMail } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    if (isSubscribedForMail !== undefined) {
      user.isSubscribedForMail = isSubscribedForMail;
    }
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isSubscribedForMail: user.isSubscribedForMail,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Initialize Admin
export const initAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@humanitycalls@2026", 12);
      const admin = new User({
        name: "Admin",
        username: process.env.ADMIN_USERNAME || "humanitycalls",
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();
      console.log("Admin user initialized");
    }
  } catch (error) {
    console.error("Admin initialization error:", error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Check if a reset token already exists and is not expired
    if (user.resetPasswordToken && user.resetPasswordExpire > Date.now()) {
      return res.status(400).json({ 
        message: "A reset link has already been sent to your email and is still valid. Please check your inbox or wait for it to expire." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const emailPayload = {
      sender: { name: process.env.BREVO_SENDER_NAME || "Humanity Calls", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: user.email }],
      subject: "Password Reset Request - Humanity Calls",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #C62828; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your Humanity Calls account. Please click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #020887; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br>The Humanity Calls Team</p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777777;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #777777; word-break: break-all;">${resetUrl}</p>
        </div>
      `,
    };

    await triggerEmail(emailPayload);

    res.status(200).json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

