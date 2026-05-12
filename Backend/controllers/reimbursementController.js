import ReimbursementRequest from "../models/ReimbursementRequest.js";
import Volunteer from "../models/Volunteer.js";
import { triggerEmail } from "./emailController.js";
import { reimbursementApprovedTemplate, reimbursementPaidTemplate } from "../utils/emailTemplates.js";

export const createReimbursementRequest = async (req, res) => {
  try {
    const { amount, purpose, spentOnDate, receiptImageUrl, receiptUrls } = req.body;

    const vol = await Volunteer.findOne({ user: req.user.id });
    if (!vol) return res.status(403).json({ message: "You must be a volunteer to request reimbursement." });

    let urls = [];
    if (Array.isArray(receiptUrls) && receiptUrls.length > 0) {
      urls = receiptUrls.map((u) => String(u || "").trim()).filter(Boolean).slice(0, 12);
    } else if (receiptImageUrl) {
      urls = [String(receiptImageUrl).trim()].filter(Boolean);
    }

    const doc = await ReimbursementRequest.create({
      user: req.user.id,
      volunteer: vol._id,
      amount: Number(amount),
      purpose,
      spentOnDate: spentOnDate ? new Date(spentOnDate) : null,
      receiptImageUrl: urls[0] || "",
      receiptUrls: urls,
    });

    // Notify admin (fire and forget)
    const adminEmail = process.env.EMAIL_TO;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
    if (process.env.BREVO_API_KEY && adminEmail && senderEmail) {
      const receiptLinks =
        urls.length > 0
          ? urls.map((u) => `<li><a href="${u}">View</a></li>`).join("")
          : receiptImageUrl
            ? `<li><a href="${receiptImageUrl}">View</a></li>`
            : "<li>—</li>";
      triggerEmail({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: adminEmail, name: "HCT Admin" }],
        subject: `New Reimbursement Request — ${vol.fullName}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New reimbursement request</h2>
            <p><strong>Name:</strong> ${vol.fullName}</p>
            <p><strong>Email:</strong> ${vol.email}</p>
            <p><strong>Amount:</strong> ₹${Number(amount)}</p>
            <p><strong>Purpose:</strong> ${purpose}</p>
            <p><strong>Receipts:</strong></p>
            <ul>${receiptLinks}</ul>
          </div>
        `,
      }).catch(() => null);
    }

    res.status(201).json({ message: "Request submitted", request: doc });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit request", error: error.message });
  }
};

export const listMyReimbursements = async (req, res) => {
  try {
    const items = await ReimbursementRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests", error: error.message });
  }
};

export const listAllReimbursements = async (_req, res) => {
  try {
    const items = await ReimbursementRequest.find()
      .populate("user", "name email")
      .populate("volunteer", "fullName volunteerId")
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests", error: error.message });
  }
};

export const updateReimbursementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!["pending", "approved", "rejected", "paid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await ReimbursementRequest.findByIdAndUpdate(
      id,
      { status, adminComment: adminComment || "" },
      { new: true },
    ).populate("user", "name email").populate("volunteer", "fullName volunteerId");

    if (!updated) return res.status(404).json({ message: "Request not found" });

    // Email volunteer on approval (requested)
    // Email volunteer on status change
    if ((status === "approved" || status === "paid") && updated.user?.email && process.env.BREVO_API_KEY) {
      const senderEmail = process.env.BREVO_SENDER_EMAIL;
      const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";
      if (senderEmail) {
        const template = status === "approved" 
          ? reimbursementApprovedTemplate(updated.user.name, updated.amount)
          : reimbursementPaidTemplate(updated.user.name, updated.amount);

        triggerEmail({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: updated.user.email, name: updated.user.name }],
          subject: status === "approved" ? `Reimbursement Approved — ₹${updated.amount}` : `Reimbursement Paid — ₹${updated.amount}`,
          htmlContent: template,
        }).catch(() => null);
      }
    }

    res.status(200).json({ message: "Updated", request: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update request", error: error.message });
  }
};

