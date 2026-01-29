import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Reusable Axios client for Brevo
const brevoClient = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    "api-key": process.env.BREVO_API_KEY,
    "content-type": "application/json",
    accept: "application/json",
  },
  timeout: 5000,
});

/**
 * Fire-and-forget email sender
 */
const triggerEmail = async (emailPayload) => {
  try {
    const response = await brevoClient.post("/smtp/email", emailPayload);
    console.log(`Email sent successfully: ${response.data.messageId}`);
  } catch (error) {
    console.error("Brevo API Error:", error.response?.data || error.message);
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
