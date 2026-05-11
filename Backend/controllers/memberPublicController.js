import mongoose from "mongoose";
import Volunteer from "../models/Volunteer.js";
import User from "../models/User.js";
import { triggerEmail } from "./emailController.js";

export const getPublicMemberCard = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid profile link" });
    }
    const user = await User.findById(userId).select("-password").populate("reportsTo", "name email phone");

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const volunteer = await Volunteer.findOne({ user: userId }).populate("referrer", "fullName").lean();

    const coordinator = user.reportsTo
      ? {
          name: user.reportsTo.name,
          email: user.reportsTo.email,
          phone: user.reportsTo.phone || "",
        }
      : null;

    const visibleVolunteer =
      volunteer && ["active", "temporary"].includes(volunteer.status) ? volunteer : null;

    res.json({
      schemaVersion: 1,
      userId: user._id.toString(),
      siteName: "Humanity Calls Trust",
      memberSince: user.createdAt,
      accountName: user.name,
      accountEmail: user.email,
      accountPhone: user.phone || "",
      coordinator,
      volunteer: visibleVolunteer
        ? {
            fullName: visibleVolunteer.fullName,
            volunteerId: visibleVolunteer.volunteerId,
            profilePicture: visibleVolunteer.profilePicture,
            bloodGroup: visibleVolunteer.bloodGroup,
            phone: visibleVolunteer.phone,
            email: visibleVolunteer.email,
            emergencyContact: visibleVolunteer.emergencyContact,
            status: visibleVolunteer.status,
            joiningDate: visibleVolunteer.joiningDate,
            referredByName: visibleVolunteer.referrer?.fullName || "",
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load profile", error: error.message });
  }
};

export const postEmergencyAlert = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId).select("-password").populate("reportsTo", "name email phone");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const volunteer = await Volunteer.findOne({ user: userId });

    const adminEmail = process.env.EMAIL_TO;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";

    const displayName = volunteer?.fullName || user.name || "Unknown";

    const detailLines = [
      "Someone scanned this member's emergency QR and requested immediate help.",
      `Person: ${displayName}`,
      user.email ? `Account email: ${user.email}` : "",
      volunteer?.phone ? `Volunteer phone: ${volunteer.phone}` : user.phone ? `Account phone: ${user.phone}` : "",
      volunteer?.emergencyContact ? `Emergency / family contact: ${volunteer.emergencyContact}` : "",
      volunteer?.volunteerId ? `Volunteer ID: ${volunteer.volunteerId}` : "",
      user.reportsTo?.name
        ? `Assigned coordinator: ${user.reportsTo.name}${user.reportsTo.email ? ` (${user.reportsTo.email})` : ""}`
        : "",
    ].filter(Boolean);

    const htmlContent = `
      <div style="font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1a1a2e;">
        ${detailLines.map((l) => `<p style="margin:0 0 12px;">${l}</p>`).join("")}
        <p style="margin:16px 0 0;font-weight:700;color:#C62828;">Please reach out to the member and emergency contacts as soon as possible.</p>
      </div>
    `;

    if (adminEmail && senderEmail && process.env.BREVO_API_KEY) {
      await triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: adminEmail, name: "Humanity Calls Admin" }],
        subject: `🚨 Emergency QR alert — ${displayName}`,
        htmlContent,
      });
    }

    res.json({ ok: true, message: "Notification sent to the organization" });
  } catch (error) {
    res.status(500).json({ message: "Could not send alert", error: error.message });
  }
};
