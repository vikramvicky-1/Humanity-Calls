import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (req, res) => {
  const { type, data, subject } = req.body;

  if (!type || !data || Object.keys(data).length === 0) {
    return res.status(400).json({ message: "Invalid submission data" });
  }

  // Server-side validation
  const entries = Object.entries(data);
  const isEmpty = entries.some(
    ([key, value]) => !value || value.toString().trim() === ""
  );
  if (isEmpty) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Phone number validation (exactly 10 digits)
  if (data.phone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.phone.toString().trim())) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 10 digits" });
    }
  }

  const emailTo = process.env.EMAIL_TO || process.env.EMAIL_USER;

  // Build HTML table for data with mobile responsiveness
  const dataRows = Object.entries(data)
    .map(
      ([key, value]) => `
      <tr>
        <td class="label">${key
          .replace(/([A-Z])/g, " $1")
          .replace(/_/g, " ")
          .trim()}</td>
        <td class="value">${value}</td>
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
      <style>
        body { margin: 0; padding: 0; background-color: #f4f4f4; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
        
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background-color: #ffffff; padding: 25px; border-bottom: 4px solid #B71C1C; text-align: left; }
        .logo-text { color: #B71C1C; font-size: 24px; font-weight: bold; font-family: 'Helvetica Neue', Arial, sans-serif; display: inline-block; vertical-align: middle; margin-left: 10px; }
        
        .content { padding: 30px 20px; font-family: 'Segoe UI', Arial, sans-serif; color: #333333; }
        .badge { display: inline-block; background-color: #fff1f0; color: #B71C1C; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 20px; border: 1px solid #ffa39e; text-transform: uppercase; }
        
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #f0f0f0; }
        .label { padding: 12px; background-color: #fcfcfc; border-bottom: 1px solid #eeeeee; font-weight: 600; font-size: 14px; width: 35%; text-transform: capitalize; color: #555555; }
        .value { padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; word-break: break-word; }
        
        .footer { background-color: #f9f9f9; padding: 30px 20px; text-align: center; font-family: Arial, sans-serif; border-top: 1px solid #eeeeee; }
        .footer-text { font-size: 13px; color: #777777; margin: 5px 0; }
        .footer-brand { color: #B71C1C; font-weight: bold; text-decoration: none; }
        
        @media only screen and (max-width: 480px) {
          .label { width: 100%; display: block; border-bottom: 0; padding-bottom: 4px; }
          .value { width: 100%; display: block; padding-top: 0; padding-bottom: 15px; }
          .header { text-align: center; }
          .logo-text { display: block; margin-left: 0; margin-top: 10px; }
        }
      </style>
    </head>
    <body>
      <div style="background-color: #f4f4f4; padding: 20px 0;">
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814230/humanitycallslogo_lazfn3.avif" alt="Logo" width="40" height="40" style="vertical-align: middle; border-radius: 5px;">
            <span class="logo-text">Humanity Calls</span>
          </div>
          
          <div class="content">
            <div class="badge">${type}</div>
            <p style="font-size: 16px; line-height: 1.5;">You have received a new <strong>${type.toLowerCase()}</strong> submission via the website.</p>
            
            <table class="data-table">
              ${dataRows}
            </table>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px; line-height: 1.6;">
              This is an automated notification from the Humanity Calls website. Please respond directly to the sender's contact details provided above.
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">© 2026 <a href="https://www.humanitycalls.org/" class="footer-brand">Humanity Calls Trust®</a>. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailTo,
    subject: subject || `New ${type} Submission - Humanity Calls`,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
