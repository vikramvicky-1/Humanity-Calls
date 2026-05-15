import Volunteer from "../models/Volunteer.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { triggerEmail } from "../controllers/emailController.js";
import {
  volunteerApplicationReceivedTemplate,
  volunteerApprovalTemplate,
  volunteerRejectionTemplate,
  volunteerBannedTemplate,
  volunteerInactiveTemplate,
  activeToTemporaryTemplate,
  temporaryToInactiveTemplate,
  temporaryToActiveTemplate,
  profilePictureRemovedByAdminTemplate,
  profilePictureReplacedByAdminTemplate,
  profilePictureReuploadRequestedByAdminTemplate,
} from "../utils/emailTemplates.js";

export const applyVolunteer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      emergencyContact,
      gender,
      interest,
      occupation,
      occupationDetail,
      skills,
      timeCommitment,
      workingMode,
      rolePreference,
      locationAddress,
      deviceDonationChoices,
      govIdType,
      bloodGroup,
      dob,
      joiningDate,
      termsAccepted,
      govIdImage,
      profilePicture,
      hasDrivingLicense,
      drivingLicenseImageUrl,
      referredBy,
    } = req.body;

    const userId = req.user ? req.user.id : null;
    const normalizedEmail = email.toLowerCase().trim();
    const existingVolunteer = await Volunteer.findOne({ email: normalizedEmail });

    if (phone === emergencyContact) {
      return res.status(400).json({
        message: "Phone number and emergency contact cannot be the same.",
      });
    }

    if (existingVolunteer) {
      if (existingVolunteer.status === "rejected") {
        await Volunteer.deleteOne({ _id: existingVolunteer._id });
      } else {
        return res.status(400).json({
          message: `You already have a ${existingVolunteer.status} application.`,
        });
      }
    }

    const hasDl = hasDrivingLicense === true || hasDrivingLicense === "true" || hasDrivingLicense === "yes";
    if (hasDl && !drivingLicenseImageUrl) {
      return res.status(400).json({
        message: "Please upload a valid driving license image when you select Yes.",
      });
    }

    const newVolunteer = new Volunteer({
      user: userId,
      fullName,
      email: normalizedEmail,
      phone,
      emergencyContact,
      gender,
      interest,
      occupation,
      occupationDetail,
      skills,
      timeCommitment,
      workingMode,
      rolePreference,
      locationAddress,
      deviceDonationChoices,
      govIdType,
      govIdImage,
      profilePicture,
      hasDrivingLicense: hasDl,
      drivingLicenseImageUrl: hasDl ? drivingLicenseImageUrl : "",
      bloodGroup,
      dob,
      joiningDate,
      termsAccepted,
      referredBy,
      adminProfileApproval: "pending",
    });

    // Handle Referral logic
    if (referredBy) {
      // Case-insensitive lookup for volunteerId
      const referrerVol = await Volunteer.findOne({ 
        volunteerId: { $regex: new RegExp(`^${referredBy.trim()}$`, "i") } 
      });
      if (referrerVol) {
        newVolunteer.referrer = referrerVol._id;
        if (userId) {
          const referrerWithUser = await Volunteer.findById(referrerVol._id).populate("user");
          if (referrerWithUser && referrerWithUser.user) {
            await User.findByIdAndUpdate(userId, { referredBy: referrerWithUser.user._id });
            await User.findByIdAndUpdate(referrerWithUser.user._id, { $addToSet: { referrals: userId } });
          }
        }
      }
    }

    await newVolunteer.save();

    // Notify admin
    const adminEmail = process.env.EMAIL_TO;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";

    if (adminEmail && senderEmail && process.env.BREVO_API_KEY) {
      triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: adminEmail, name: "Humanity Calls Admin" }],
        subject: `📋 New Volunteer Application — ${fullName}`,
        htmlContent: volunteerApplicationReceivedTemplate(newVolunteer),
      }).catch((err) => console.error("Admin notification email failed:", err.message));
    }

    res.status(201).json({ message: "Application submitted successfully", volunteer: newVolunteer });
  } catch (error) {
    res.status(500).json({ message: "Error submitting application", error: error.message });
  }
};

export const getMyVolunteerStatus = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user.id }).populate("referrer", "fullName");
    if (!volunteer) return res.status(200).json({ status: "none" });
    res.status(200).json({ status: volunteer.status, volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteer status", error: error.message });
  }
};

export const getActiveVolunteerCount = async (req, res) => {
  try {
    const count = await Volunteer.countDocuments({ status: { $in: ["active", "temporary", "inactive"] } });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteer count", error: error.message });
  }
};

export const getVolunteers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const volunteers = await Volunteer.find(filter)
      .populate("user", "name email")
      .populate("referrer", "fullName volunteerId")
      .sort({ joiningDate: 1, createdAt: 1 });
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteers", error: error.message });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["pending", "active", "temporary", "inactive", "rejected", "banned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const previous = await Volunteer.findById(id);
    if (!previous) return res.status(404).json({ message: "Volunteer not found" });

    const needsProfileApproval =
      previous.status === "pending" &&
      ["active", "temporary", "inactive"].includes(status);
    const profileApproval = previous.adminProfileApproval ?? "approved";
    if (needsProfileApproval && profileApproval !== "approved") {
      return res.status(400).json({
        message:
          "Approve the volunteer profile before moving them to Active, Temporary, or Inactive from Pending.",
      });
    }

    const updateData = { status };
    if (status === "rejected") updateData.rejectionReason = reason;
    if (status === "banned") updateData.banReason = reason;

    if (status === "active" || status === "temporary") {
      const existing = await Volunteer.findById(id);
      if (existing && !existing.volunteerId) {
        const date = new Date(existing.joiningDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        const dateStr = `${day}${month}${year}`;

        let isUnique = false;
        let finalId = "";
        while (!isUnique) {
          const random = Math.floor(1000 + Math.random() * 9000);
          finalId = `HCT${dateStr}${random}`;
          const check = await Volunteer.findOne({ volunteerId: finalId });
          if (!check) isUnique = true;
        }
        updateData.volunteerId = finalId;
      }
    }

    const volunteer = await Volunteer.findByIdAndUpdate(id, updateData, { new: true })
      .populate("user", "name email")
      .populate("referrer", "fullName volunteerId");

    // Handle Comprehensive Status Transition Emails
    if (volunteer.email && process.env.BREVO_API_KEY) {
      const senderEmail = process.env.BREVO_SENDER_EMAIL;
      const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const supportEmail = process.env.EMAIL_TO || senderEmail || "support@humanitycalls.org";

      if (senderEmail) {
        const from = previous.status;
        const to = status;
        let subject = null;
        let htmlContent = null;

        // 1. APPROVAL / REINSTATEMENT (From Pending, Rejected, or Banned TO Active or Temporary)
        if ((from === "pending" || from === "rejected" || from === "banned") && (to === "active" || to === "temporary")) {
          subject = `🎉 Congratulations! You're Approved as a Humanity Calls Volunteer`;
          htmlContent = volunteerApprovalTemplate(volunteer, frontendUrl);
        }
        
        // 2. REJECTION (From Pending TO Rejected)
        else if (from === "pending" && to === "rejected") {
          subject = `Volunteer Application Update — Humanity Calls`;
          htmlContent = volunteerRejectionTemplate(volunteer.fullName, reason);
        }

        // 3. MOVING TO ACTIVE (From Inactive or Temporary TO Active)
        else if ((from === "inactive" || from === "temporary") && to === "active") {
          subject = "Congratulations! You’re Now an Active Member";
          htmlContent = temporaryToActiveTemplate();
        }

        // 4. MOVING TO TEMPORARY (From Active or Inactive TO Temporary)
        else if ((from === "active" || from === "inactive") && to === "temporary") {
          subject = "Profile Status Update – Moved to Temporary";
          htmlContent = activeToTemporaryTemplate(supportEmail);
        }

        // 5. MOVING TO INACTIVE (From Active or Temporary TO Inactive)
        else if ((from === "active" || from === "temporary") && to === "inactive") {
          subject = "Profile Status Update – Moved to Inactive";
          htmlContent = temporaryToInactiveTemplate(supportEmail);
        }

        // 6. MOVING TO BANNED (From Any TO Banned)
        else if (to === "banned") {
          subject = "Account Restricted — Humanity Calls";
          htmlContent = volunteerBannedTemplate(volunteer.fullName, reason);
        }
        
        // 7. MOVING TO INACTIVE (General fallback for other states to Inactive)
        else if (to === "inactive" && from !== "inactive") {
          subject = "Profile Inactive — Humanity Calls";
          htmlContent = volunteerInactiveTemplate(volunteer.fullName);
        }

        if (subject && htmlContent) {
          triggerEmail({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: volunteer.email, name: volunteer.fullName }],
            subject,
            htmlContent,
          }).catch((err) => console.error(`Email notification failed for ${from}->${to}:`, err.message));
        }
      }
    }

    res.status(200).json({ message: `Volunteer marked as ${status}`, volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

export const updateMyProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    if (!profilePicture) return res.status(400).json({ message: "Profile picture URL is required" });
    const volunteer = await Volunteer.findOneAndUpdate({ user: req.user.id }, { profilePicture }, { new: true });
    if (!volunteer) return res.status(404).json({ message: "Volunteer record not found" });
    res.status(200).json({ message: "Profile picture updated", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile picture", error: error.message });
  }
};

const VOLUNTEER_ADMIN_UPDATE_FIELDS = new Set([
  "fullName",
  "email",
  "phone",
  "emergencyContact",
  "gender",
  "interest",
  "occupation",
  "occupationDetail",
  "skills",
  "timeCommitment",
  "workingMode",
  "rolePreference",
  "locationAddress",
  "deviceDonationChoices",
  "govIdType",
  "govIdImage",
  "hasDrivingLicense",
  "drivingLicenseImageUrl",
  "bloodGroup",
  "dob",
  "joiningDate",
  "termsAccepted",
  "profilePicture",
  "referredBy",
]);

export const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {};
    for (const key of VOLUNTEER_ADMIN_UPDATE_FIELDS) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    const volunteer = await Volunteer.findByIdAndUpdate(id, payload, { new: true })
      .populate("user", "name email")
      .populate("referrer", "fullName volunteerId");
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
    res.status(200).json({ message: "Volunteer updated successfully", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating volunteer", error: error.message });
  }
};

export const updateVolunteerProfileApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be approved or rejected" });
    }
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { adminProfileApproval: decision },
      { new: true },
    )
      .populate("user", "name email")
      .populate("referrer", "fullName volunteerId");
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
    res.status(200).json({ message: "Profile review updated", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile approval", error: error.message });
  }
};

export const adminRequestProfileReupload = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
    volunteer.profileReuploadRequestedAt = new Date();
    await volunteer.save();
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
    if (volunteer.email && senderEmail && process.env.BREVO_API_KEY) {
      triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: volunteer.email, name: volunteer.fullName }],
        subject: "Please re-upload your profile photo — Humanity Calls",
        htmlContent: profilePictureReuploadRequestedByAdminTemplate(volunteer.fullName),
      }).catch((err) => console.error("Re-upload request email failed:", err.message));
    }
    res.status(200).json({ message: "Volunteer notified to re-upload profile photo", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error sending re-upload request", error: error.message });
  }
};

export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    const userId = volunteer.user;

    // 1. If this person was a referrer for others, clear their links
    await Volunteer.updateMany(
      { referrer: id },
      { $set: { referrer: null, referredBy: "" } }
    );
    
    if (userId) {
      await User.updateMany(
        { referredBy: userId },
        { $set: { referredBy: null } }
      );
    }

    // 2. If this person was referred by someone else, remove them from that person's referral list
    if (userId) {
      await User.updateMany(
        { referrals: userId },
        { $pull: { referrals: userId } }
      );
    }

    await Volunteer.findByIdAndDelete(id);
    res.status(200).json({ message: "Volunteer and associated referral links deleted completely" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting volunteer", error: error.message });
  }
};

export const adminRemoveVolunteerProfilePicture = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
    volunteer.profilePicture = "";
    await volunteer.save();
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
    if (volunteer.email && senderEmail && process.env.BREVO_API_KEY) {
      triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: volunteer.email, name: volunteer.fullName }],
        subject: "Please upload a new profile photo — Humanity Calls",
        htmlContent: profilePictureRemovedByAdminTemplate(volunteer.fullName),
      }).catch((err) => console.error("Profile removal email failed:", err.message));
    }
    res.status(200).json({ message: "Profile picture removed", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating volunteer", error: error.message });
  }
};

export const adminReplaceVolunteerProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
    volunteer.profilePicture = req.file.path;
    await volunteer.save();
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
    if (volunteer.email && senderEmail && process.env.BREVO_API_KEY) {
      triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: volunteer.email, name: volunteer.fullName }],
        subject: "Your profile photo was updated by admin — Humanity Calls",
        htmlContent: profilePictureReplacedByAdminTemplate(volunteer.fullName),
      }).catch((err) => console.error("Profile replace email failed:", err.message));
    }
    res.status(200).json({ message: "Profile picture updated", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile picture", error: error.message });
  }
};

/** Admin: replace profile with image or PDF via memory upload + Cloudinary. */
export const adminReplaceVolunteerProfileMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "humanity_calls_volunteers/profiles",
      resource_type: "auto",
    });
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
    volunteer.profilePicture = uploaded.secure_url;
    await volunteer.save();
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
    if (volunteer.email && senderEmail && process.env.BREVO_API_KEY) {
      triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: volunteer.email, name: volunteer.fullName }],
        subject: "Your profile photo was updated by admin — Humanity Calls",
        htmlContent: profilePictureReplacedByAdminTemplate(volunteer.fullName),
      }).catch((err) => console.error("Profile replace email failed:", err.message));
    }
    res.status(200).json({ message: "Profile media updated", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile media", error: error.message });
  }
};

export const verifyVolunteerId = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findOne({ 
      volunteerId: { $regex: new RegExp(`^${id.trim()}$`, "i") }, 
      status: { $in: ["active", "temporary"] } 
    });
    if (!volunteer) return res.status(404).json({ message: "Invalid or inactive Volunteer ID" });
    res.status(200).json({ name: volunteer.fullName });
  } catch (error) {
    res.status(500).json({ message: "Error verifying Volunteer ID", error: error.message });
  }
};

export const getReferralStats = async (req, res) => {
  try {
    const referrers = await User.find({ "referrals.0": { $exists: true } })
      .select("name email referrals")
      .populate("referrals", "name email createdAt")
      .lean();
    res.status(200).json(referrers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch referral stats", error: error.message });
  }
};

export const setManualReferral = async (req, res) => {
  try {
    const { referralId } = req.body;
    const userId = req.user.id;

    if (!referralId) return res.status(400).json({ message: "Referral ID is required" });

    const volunteer = await Volunteer.findOne({ user: userId });
    if (!volunteer) return res.status(404).json({ message: "Volunteer profile not found" });

    if (volunteer.referrer) {
      return res.status(400).json({ message: "Referral already assigned" });
    }

    // Lookup referrer
    const referrerVol = await Volunteer.findOne({
      volunteerId: { $regex: new RegExp(`^${referralId.trim()}$`, "i") },
      status: { $in: ["active", "temporary"] }
    }).populate("user");

    if (!referrerVol) {
      return res.status(404).json({ message: "Invalid or inactive Referral ID" });
    }

    if (referrerVol.user && referrerVol.user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot refer yourself" });
    }

    // Update volunteer record
    volunteer.referrer = referrerVol._id;
    volunteer.referredBy = referralId.toUpperCase().trim();
    await volunteer.save();

    // Update User records for relationship tracking
    if (referrerVol.user) {
      await User.findByIdAndUpdate(userId, { referredBy: referrerVol.user._id });
      await User.findByIdAndUpdate(referrerVol.user._id, { $addToSet: { referrals: userId } });
    }

    res.status(200).json({ 
      message: "Referral assigned successfully", 
      referrerName: referrerVol.fullName,
      volunteer 
    });
  } catch (error) {
    res.status(500).json({ message: "Error setting referral", error: error.message });
  }
};
