import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import MassMail from "../models/MassMail.js";
import { genericMassEmailTemplate } from "../utils/emailTemplates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Reusable Axios client for Brevo
const getBrevoClient = () => {
  return axios.create({
    baseURL: "https://api.brevo.com/v3",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
      Connection: "close" 
    },
    timeout: 10000,
  });
};

/**
 * Send mass email to selected groups
 */
export const sendMassEmail = async (req, res) => {
  const { 
    subject, 
    heading, 
    body, 
    bannerImage, 
    selectedGroups, 
    selectedIndividualVolunteers = [], 
    selectedIndividualUsers = [] 
  } = req.body;

  if (!subject || !heading || !body || (!selectedGroups?.length && !selectedIndividualVolunteers?.length && !selectedIndividualUsers?.length)) {
    return res.status(400).json({ message: "Missing required fields or recipients" });
  }

  try {
    let recipientEmails = new Map(); // Use Map to store {email: name} and avoid duplicates

    // 1. Fetch by Selected Groups
    if (selectedGroups.includes("all")) {
      // All active, temporary, and users
      const [activeVols, tempVols, users] = await Promise.all([
        Volunteer.find({ status: "active" }).select("email fullName"),
        Volunteer.find({ status: "temporary" }).select("email fullName"),
        User.find({ role: "user" }).select("email name")
      ]);
      activeVols.forEach(v => recipientEmails.set(v.email, v.fullName));
      tempVols.forEach(v => recipientEmails.set(v.email, v.fullName));
      users.forEach(u => recipientEmails.set(u.email, u.name));
    } else {
      if (selectedGroups.includes("active_volunteers")) {
        const activeVols = await Volunteer.find({ status: "active" }).select("email fullName");
        activeVols.forEach(v => recipientEmails.set(v.email, v.fullName));
      }

      if (selectedGroups.includes("temporary_volunteers")) {
        const tempVols = await Volunteer.find({ status: "temporary" }).select("email fullName");
        tempVols.forEach(v => recipientEmails.set(v.email, v.fullName));
      }

      if (selectedGroups.includes("users")) {
        const users = await User.find({ role: "user" }).select("email name");
        users.forEach(u => recipientEmails.set(u.email, u.name));
      }
    }

    // 2. Fetch Individual Volunteers
    if (selectedIndividualVolunteers.length > 0) {
      const individualVols = await Volunteer.find({ _id: { $in: selectedIndividualVolunteers } }).select("email fullName");
      individualVols.forEach(v => recipientEmails.set(v.email, v.fullName));
    }

    // 3. Fetch Individual Users
    if (selectedIndividualUsers.length > 0) {
      const individualUsers = await User.find({ _id: { $in: selectedIndividualUsers } }).select("email name");
      individualUsers.forEach(u => recipientEmails.set(u.email, u.name));
    }

    const recipientsArray = Array.from(recipientEmails.entries()).map(([email, name]) => ({ email, name }));

    if (recipientsArray.length === 0) {
      return res.status(404).json({ message: "No recipients found for the selection" });
    }

    // Save history record
    const massMailRecord = await MassMail.create({
      subject,
      heading,
      body,
      bannerImage,
      recipients: [
        ...(selectedGroups || []),
        ...(selectedIndividualVolunteers.length > 0 ? ["individual_volunteers"] : []),
        ...(selectedIndividualUsers.length > 0 ? ["individual_users"] : [])
      ],
      sentCount: recipientsArray.length,
      admin: req.user._id,
    });

    res.status(200).json({ 
      message: `Mass email initiated for ${recipientsArray.length} recipients`,
      recordId: massMailRecord._id 
    });

    processMassEmails(recipientsArray, subject, heading, body, bannerImage);

  } catch (error) {
    console.error("Mass Email Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all potential recipients (volunteers and users) for individual selection
 */
export const getAllPotentialRecipients = async (req, res) => {
  try {
    const [activeVols, tempVols, users] = await Promise.all([
      Volunteer.find({ status: "active" }).select("fullName email volunteerId"),
      Volunteer.find({ status: "temporary" }).select("fullName email volunteerId"),
      User.find({ role: "user" }).select("name email")
    ]);

    const formattedVols = [
      ...activeVols.map(v => ({ id: v._id, name: v.fullName, email: v.email, displayId: v.volunteerId, type: "active_vol" })),
      ...tempVols.map(v => ({ id: v._id, name: v.fullName, email: v.email, displayId: v.volunteerId, type: "temp_vol" }))
    ];

    const formattedUsers = users.map(u => ({ id: u._id, name: u.name, email: u.email, type: "user" }));

    res.json({
      volunteers: formattedVols,
      users: formattedUsers
    });
  } catch (error) {
    console.error("Get Potential Recipients Error:", error);
    res.status(500).json({ message: "Failed to fetch recipients" });
  }
};

/**
 * Helper to process emails in chunks
 */
const processMassEmails = async (recipients, subject, heading, body, bannerImage) => {
  const CHUNK_SIZE = 25; // Send 25 emails at a time to stay safe
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";

  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE);
    
    // Send emails in the current chunk in parallel
    await Promise.allSettled(chunk.map(async (recipient) => {
      try {
        const htmlContent = genericMassEmailTemplate(recipient.name, heading, body, bannerImage);
        const emailPayload = {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: recipient.email, name: recipient.name }],
          subject: subject,
          htmlContent: htmlContent,
        };
        await triggerEmail(emailPayload);
      } catch (err) {
        console.error(`Failed to send mass email to ${recipient.email}:`, err.message);
      }
    }));

    // Optional delay between chunks to avoid hitting rate limits too hard
    if (i + CHUNK_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.log(`Mass email sending completed for ${recipients.length} recipients.`);
};

/**
 * Get mass email history
 */
export const getMassMailHistory = async (req, res) => {
  try {
    const history = await MassMail.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch email history" });
  }
};

export const triggerEmail = async (emailPayload) => {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to send email to: ${emailPayload.to[0].email}`);
      const brevoClient = getBrevoClient();
      const response = await brevoClient.post("/smtp/email", emailPayload);
      console.log(`Email sent successfully: ${response.data.messageId}`);
      return response.data;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("Brevo API Error Detail:");
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
          console.error("Message:", error.message);
        }
        throw error;
      }
      console.warn(`Attempt ${attempt} failed with error: ${error.message}. Retrying in 1s...`);
      await new Promise(res => setTimeout(res, 1000));
    }
  }
};

export const sendEmail = (req, res) => {
  const { type, data, subject } = req.body;

  // Essential safety checks
  if (!type || !data || Object.keys(data).length === 0) {
    return res.status(200).json({ message: "Acknowledged with missing data" });
  }

  const emailTo = process.env.EMAIL_TO;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";

  if (!process.env.BREVO_API_KEY || !emailTo || !senderEmail) {
    console.error("Missing required environment variables for email");
    return res.status(200).json({ message: "Acknowledged (Config Error)" });
  }

  // Lightweight HTML table for data
  const enrichedData = {
    ...data,
    "__Submitted By (Verified)__": `${req.user.name} (${req.user.email})`,
  };

  const dataRows = Object.entries(enrichedData)
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E6E1DC; font-weight: 600; color: #4A4A68; font-size: 14px; width: 40%; text-transform: capitalize;">
          ${key.startsWith("__") ? key.replace(/__/g, "") : key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E6E1DC; color: #1E1E2F; font-size: 14px; word-break: break-word;">
          ${value}
        </td>
      </tr>
    `
    )
    .join("");

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #FBF7F4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FBF7F4">
        <tr>
          <td align="center" style="padding: 20px 10px;">
            <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="padding: 25px; border-bottom: 1px solid #E6E1DC; text-align: left; background-color: #ffffff;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="vertical-align: middle;">
                        <img src="https://res.cloudinary.com/daokrum7i/image/upload/v1768550123/favicon-32x32_kca2tb.png" alt="HC" width="32" height="32" style="display: block; border-radius: 4px;">
                      </td>
                      <td style="vertical-align: middle; padding-left: 12px;">
                        <span style="font-size: 22px; font-weight: bold; color: #C62828; letter-spacing: -0.5px; display: block;">Humanity Calls</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 35px 25px 15px 25px;">
                  <div style="display: inline-block; background-color: #020887; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 20px;">
                    ${type}
                  </div>
                  <h2 style="margin: 0; color: #1E1E2F; font-size: 22px; line-height: 1.2;">New Website Submission</h2>
                  <p style="color: #4A4A68; font-size: 16px; line-height: 1.6; margin-top: 12px;">You have received a new inquiry via the <strong>Humanity Calls</strong> platform. Details are provided below:</p>
                </td>
              </tr>
              <!-- Data Table -->
              <tr>
                <td style="padding: 0 25px 40px 25px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #E6E1DC; border-radius: 10px; overflow: hidden;">
                    ${dataRows}
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td bgcolor="#1A1A1A" style="padding: 35px 25px; text-align: center;">
                  <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">Humanity Calls Trust&reg;</p>
                  <p style="margin: 8px 0 0 0; color: #6C9A8B; font-size: 13px; font-style: italic;">"Helping Humanity, Saving Lives"</p>
                  <div style="margin-top: 25px; border-top: 1px solid #333333; padding-top: 25px;">
                    <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.4;">
                      &copy; ${new Date().getFullYear()} Humanity Calls. All Rights Reserved.<br>
                      This is an automated notification. Please do not reply directly to this email.
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const emailPayload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: emailTo }],
    subject: subject || `New ${type} Submission - Humanity Calls`,
    htmlContent: htmlTemplate,
  };

  // 1. Send immediate response to client
  res.status(200).json({ message: "Submission received" });

  // 2. Trigger email in background (fire-and-forget)
  triggerEmail(emailPayload);
};

export const sendPublicDonationEmail = (req, res) => {
  const { data, subject } = req.body;

  // Donation is allowed without login; keep minimal validation
  if (!data || typeof data !== "object") {
    return res.status(400).json({ message: "Missing donation data" });
  }

  const emailTo = process.env.EMAIL_TO;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";

  if (!process.env.BREVO_API_KEY || !emailTo || !senderEmail) {
    console.error("Missing required environment variables for email");
    return res.status(200).json({ message: "Acknowledged (Config Error)" });
  }

  const enrichedData = {
    ...data,
    "__Submitted By__": `${data?.name || "Anonymous"} (${data?.email || "N/A"})`,
    "__Submitted Without Login__": "Yes",
  };

  const dataRows = Object.entries(enrichedData)
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E6E1DC; font-weight: 600; color: #4A4A68; font-size: 14px; width: 40%; text-transform: capitalize;">
          ${key.startsWith("__") ? key.replace(/__/g, "") : key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E6E1DC; color: #1E1E2F; font-size: 14px; word-break: break-word;">
          ${value}
        </td>
      </tr>
    `
    )
    .join("");

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #FBF7F4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FBF7F4">
        <tr>
          <td align="center" style="padding: 20px 10px;">
            <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <tr>
                <td style="padding: 25px; border-bottom: 1px solid #E6E1DC; text-align: left; background-color: #ffffff;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="vertical-align: middle;">
                        <img src="https://res.cloudinary.com/daokrum7i/image/upload/v1768550123/favicon-32x32_kca2tb.png" alt="HC" width="32" height="32" style="display: block; border-radius: 4px;">
                      </td>
                      <td style="vertical-align: middle; padding-left: 12px;">
                        <span style="font-size: 22px; font-weight: bold; color: #C62828; letter-spacing: -0.5px; display: block;">Humanity Calls</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 35px 25px 15px 25px;">
                  <div style="display: inline-block; background-color: #C62828; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 20px;">
                    Donation Inquiry
                  </div>
                  <h2 style="margin: 0; color: #1E1E2F; font-size: 22px; line-height: 1.2;">New Donation Submission (Public)</h2>
                  <p style="color: #4A4A68; font-size: 16px; line-height: 1.6; margin-top: 12px;">
                    You have received a new donation submission via the <strong>Humanity Calls</strong> website.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 25px 40px 25px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #E6E1DC; border-radius: 10px; overflow: hidden;">
                    ${dataRows}
                  </table>
                </td>
              </tr>
              <tr>
                <td bgcolor="#1A1A1A" style="padding: 35px 25px; text-align: center;">
                  <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">Humanity Calls Trust&reg;</p>
                  <p style="margin: 8px 0 0 0; color: #6C9A8B; font-size: 13px; font-style: italic;">"Helping Humanity, Saving Lives"</p>
                  <div style="margin-top: 25px; border-top: 1px solid #333333; padding-top: 25px;">
                    <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.4;">
                      &copy; ${new Date().getFullYear()} Humanity Calls. All Rights Reserved.<br>
                      This is an automated notification. Please do not reply directly to this email.
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const emailPayload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: emailTo }],
    subject: subject || `New Donation Submission - Humanity Calls`,
    htmlContent: htmlTemplate,
  };

  res.status(200).json({ message: "Donation submission received" });
  triggerEmail(emailPayload);
};
