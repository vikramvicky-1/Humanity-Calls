import cron from "node-cron";
import Volunteer from "../models/Volunteer.js";
import { birthdayWishTemplate } from "./emailTemplates.js";
import { triggerEmail } from "../controllers/emailController.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * Logic to check for birthdays and send emails
 */
export const checkAndSendBirthdayEmails = async () => {
  try {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed

    console.log(`[BirthdayCron] Checking for birthdays on ${currentDay}/${currentMonth}...`);

    // Find volunteers who are active or temporary and have a birthday today
    const birthdayVolunteers = await Volunteer.find({
      status: { $in: ["active", "temporary"] },
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: "$dob" }, currentDay] },
          { $eq: [{ $month: "$dob" }, currentMonth] },
        ],
      },
    });

    if (birthdayVolunteers.length === 0) {
      console.log("[BirthdayCron] No birthdays found today.");
      return;
    }

    console.log(`[BirthdayCron] Found ${birthdayVolunteers.length} volunteer(s) with birthdays today.`);

    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Humanity Calls";

    for (const volunteer of birthdayVolunteers) {
      try {
        const htmlContent = birthdayWishTemplate(volunteer.fullName);
        const emailPayload = {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: volunteer.email, name: volunteer.fullName }],
          subject: "Happy Birthday Wishes from Humanity Calls 🎉",
          htmlContent: htmlContent,
        };

        console.log(`[BirthdayCron] Sending birthday wish to ${volunteer.fullName} (${volunteer.email})...`);
        await triggerEmail(emailPayload);
      } catch (err) {
        console.error(`[BirthdayCron] Failed to send email to ${volunteer.email}:`, err.message);
      }
    }

    console.log("[BirthdayCron] Birthday email processing completed.");
  } catch (error) {
    console.error("[BirthdayCron] Error in birthday cron job:", error);
  }
};

/**
 * Initialize the cron job to run daily at 12:00 AM
 */
export const initBirthdayCron = () => {
  // schedule runs at 00:00 (12:00 AM) every day
  cron.schedule("0 0 * * *", () => {
    console.log("[BirthdayCron] Running daily birthday check...");
    checkAndSendBirthdayEmails();
  }, {
    timezone: "Asia/Kolkata" // Setting to IST as requested in previous conversations
  });

  console.log("[BirthdayCron] Birthday cron job scheduled for 12:00 AM daily (Asia/Kolkata).");
};
