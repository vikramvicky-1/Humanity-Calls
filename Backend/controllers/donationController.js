import Donation from "../models/Donation.js";
import axios from "axios";
import { donationThankYouTemplate } from "../utils/emailTemplates.js";

// Reusable Axios client for Brevo
const getBrevoClient = () => {
  return axios.create({
    baseURL: "https://api.brevo.com/v3",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    timeout: 10000,
  });
};

export const createDonation = async (req, res) => {
  try {
    const { name, email, phone, amount, transactionId, locationAddress, donationImageUrl } = req.body;
    
    // Check if transactionId already exists
    const existing = await Donation.findOne({ transactionId });
    if (existing) {
      return res.status(400).json({ message: "Transaction ID already submitted" });
    }

    const donation = await Donation.create({
      name,
      email,
      phone,
      amount,
      transactionId,
      locationAddress,
      donationImageUrl,
    });

    res.status(201).json({ message: "Donation details submitted successfully", donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "approved" })
      .select("name amount locationAddress createdAt donationImageUrl")
      .sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const oldStatus = donation.status;
    donation.status = status;
    if (adminComment !== undefined) donation.adminComment = adminComment;
    await donation.save();

    // If status changed to approved, send thank you email
    if (status === "approved" && oldStatus !== "approved") {
      try {
        const brevo = getBrevoClient();
        const htmlContent = donationThankYouTemplate(donation.name, donation.amount);
        
        await brevo.post("/smtp/email", {
          sender: { name: "Humanity Calls Trust", email: process.env.BREVO_SENDER_EMAIL },
          to: [{ email: donation.email, name: donation.name }],
          subject: `A Heartfelt Thank You, ${donation.name}! ❤️`,
          htmlContent,
        });
      } catch (emailError) {
        console.error("Failed to send thank you email:", emailError.message);
        // We don't fail the request just because the email failed
      }
    }

    res.status(200).json({ message: `Donation ${status}`, donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    await Donation.findByIdAndDelete(id);
    res.status(200).json({ message: "Donation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
