import Volunteer from "../models/Volunteer.js";
import { generateIdCard } from "../utils/idCardGenerator.js";

/**
 * Download Volunteer ID Card
 */
export const downloadIdCard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    // Admin OR Owner
    if (
      req.user.role !== "admin" &&
      volunteer.user?.toString() !== req.user.id?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to download this ID card",
      });
    }

    if (volunteer.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Volunteer ID card is only available for active volunteers",
      });
    }

    const pdfBuffer = await generateIdCard(volunteer);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${volunteer.volunteerId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Download ID Card Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate ID card",
    });
  }
};
/**
 * Verify Volunteer via QR
 */
export const verifyVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const volunteer = await Volunteer.findOne({ volunteerId });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Invalid Volunteer ID",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        fullName: volunteer.fullName,
        volunteerId: volunteer.volunteerId,
        status: volunteer.status,
        memberSince: volunteer.joiningDate,
        profilePicture: volunteer.profilePicture,
        verified: volunteer.status === "active",
      },
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};
