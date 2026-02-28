import Volunteer from "../models/Volunteer.js";
import { triggerEmail } from "../controllers/emailController.js";
import {
  volunteerApplicationReceivedTemplate,
  volunteerApprovalTemplate,
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
      govIdType,
      bloodGroup,
      dob,
      joiningDate,
      termsAccepted,
      govIdImage,
      profilePicture,
    } = req.body;

    const user = await import("../models/User.js").then(m => m.default).then(User => User.findById(req.user.id));
    if (!user || user.isVerified !== true) {
      return res.status(403).json({
        message: "You must verify your email address before applying to volunteer.",
      });
    }

    const existingVolunteer = await Volunteer.findOne({ user: req.user.id });
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

    const newVolunteer = new Volunteer({
      user: req.user.id,
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
      govIdType,
      govIdImage,
      profilePicture,
      bloodGroup,
      dob,
      joiningDate,
      termsAccepted,
    });

    await newVolunteer.save();

    // Fire-and-forget: notify admin about new application
    const adminEmail = process.env.EMAIL_TO;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";

    if (adminEmail && senderEmail && process.env.BREVO_API_KEY) {
      triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: adminEmail, name: "Humanity Calls Admin" }],
        subject: `📋 New Volunteer Application — ${fullName}`,
        htmlContent: volunteerApplicationReceivedTemplate(newVolunteer),
      }).catch((err) =>
        console.error("Admin notification email failed:", err.message)
      );
    }

    res.status(201).json({
      message: "Application submitted successfully",
      volunteer: newVolunteer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting application", error: error.message });
  }
};

export const getMyVolunteerStatus = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user.id });
    if (!volunteer) {
      return res.status(200).json({ status: "none" });
    }
    res.status(200).json({ status: volunteer.status, volunteer });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching volunteer status",
      error: error.message,
    });
  }
};

export const getActiveVolunteerCount = async (req, res) => {
  try {
    const count = await Volunteer.countDocuments({ status: "active" });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteer count", error: error.message });
  }
};

export const getVolunteers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const volunteers = await Volunteer.find(filter).populate(
      "user",
      "name email"
    );
    res.status(200).json(volunteers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching volunteers", error: error.message });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["pending", "active", "temporary", "rejected", "banned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };
    if (status === "rejected") updateData.rejectionReason = reason;
    if (status === "banned") updateData.banReason = reason;

    // Generate volunteerId when moving to active or temporary
    if (status === "active" || status === "temporary") {
      const existing = await Volunteer.findById(id);
      if (existing && !existing.volunteerId) {
        // Generate Unique ID: HC + DDMMYY + 4 Random Numbers
        const date = new Date(existing.joiningDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        const dateStr = `${day}${month}${year}`;

        let isUnique = false;
        let finalId = "";
        while (!isUnique) {
          const random = Math.floor(1000 + Math.random() * 9000); // 4 digits
          finalId = `HCT${dateStr}${random}`;
          const check = await Volunteer.findOne({ volunteerId: finalId });
          if (!check) isUnique = true;
        }
        updateData.volunteerId = finalId;
      }
    }

    const volunteer = await Volunteer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Fire-and-forget: notify volunteer on approval (active or temporary)
    if ((status === "active" || status === "temporary") && volunteer.email) {
      const senderEmail = process.env.BREVO_SENDER_EMAIL;
      const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

      if (senderEmail && process.env.BREVO_API_KEY) {
        triggerEmail({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: volunteer.email, name: volunteer.fullName }],
          subject: `🎉 Congratulations! You're Approved as a Humanity Calls Volunteer`,
          htmlContent: volunteerApprovalTemplate(volunteer, frontendUrl),
        }).catch((err) =>
          console.error("Volunteer approval email failed:", err.message)
        );
      }
    }

    res
      .status(200)
      .json({ message: `Volunteer marked as ${status}`, volunteer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

export const updateMyProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    if (!profilePicture) {
      return res
        .status(400)
        .json({ message: "Profile picture URL is required" });
    }

    const volunteer = await Volunteer.findOneAndUpdate(
      { user: req.user.id },
      { profilePicture },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer record not found" });
    }

    res.status(200).json({ message: "Profile picture updated", volunteer });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile picture",
      error: error.message,
    });
  }
};

export const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const volunteer = await Volunteer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    res
      .status(200)
      .json({ message: "Volunteer updated successfully", volunteer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating volunteer", error: error.message });
  }
};

export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByIdAndDelete(id);

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    res.status(200).json({ message: "Volunteer deleted completely" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting volunteer", error: error.message });
  }
};
