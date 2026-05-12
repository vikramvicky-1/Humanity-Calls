/**
 * Email HTML templates for volunteer notifications
 */

const LOGO_URL =
  "https://res.cloudinary.com/daokrum7i/image/upload/v1768550123/favicon-32x32_kca2tb.png";

const year = new Date().getFullYear();

/** Shared outer wrapper & header */
const wrap = (inner, preheader = "") => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Humanity Calls</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F4F6FB;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:#F4F6FB;">${preheader}&nbsp;</div>` : ""}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F4F6FB">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <!-- Card -->
        <table border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Logo Header -->
          <tr>
            <td style="background:#C62828;padding:24px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${LOGO_URL}" alt="HC" width="36" height="36" style="display:block;border-radius:8px;background:#fff;">
                  </td>
                  <td style="vertical-align:middle;padding-left:12px;">
                    <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Humanity Calls</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${inner}

          <!-- Footer -->
          <tr>
            <td style="background:#1A1A2E;padding:32px 24px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.5px;">Humanity Calls Trust&reg;</p>
              <p style="margin:8px 0 0;color:#7CA68C;font-size:13px;font-style:italic;">"Helping Humanity, Saving Lives"</p>
              <div style="margin-top:20px;border-top:1px solid #2E2E4E;padding-top:20px;">
                <p style="margin:0;color:#777;font-size:11px;line-height:1.6;">
                  &copy; ${year} Humanity Calls Trust. All Rights Reserved.<br>
                  This is an automated notification. Please do not reply to this email.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Template 1 — Admin notification: new volunteer application received
 */
export const volunteerApplicationReceivedTemplate = (vol) => {
  const formatArray = (val) => {
    if (!val) return "N/A";
    return Array.isArray(val) ? val.join(", ") : val;
  };

  const dobFormatted = vol.dob
    ? new Date(vol.dob).toLocaleDateString("en-GB")
    : "N/A";

  const rows = [
    ["Full Name", vol.fullName],
    ["Email Address", vol.email],
    ["Phone Number", vol.phone],
    ["Gender", vol.gender || "N/A"],
    ["Date of Birth", dobFormatted],
    ["Blood Group", vol.bloodGroup || "N/A"],
    ["Interest Area", vol.interest || "N/A"],
    [
      "Occupation",
      vol.occupation === "Other"
        ? vol.occupationDetail || "Other"
        : vol.occupation || "N/A",
    ],
    ["Skills Offered", vol.skills || "N/A"],
    ["Gov ID Type", vol.govIdType || "N/A"],
    ["Valid Driving License", vol.hasDrivingLicense ? "Yes" : "No"],
    [
      "Driving License Document",
      vol.hasDrivingLicense && vol.drivingLicenseImageUrl
        ? `<a href="${vol.drivingLicenseImageUrl}" target="_blank" rel="noreferrer">View uploaded license</a>`
        : "N/A",
    ],
    ["Time Commitment", formatArray(vol.timeCommitment)],
    ["Working Mode", formatArray(vol.workingMode)],
    ["Role Preference", formatArray(vol.rolePreference)],
  ]
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;font-weight:600;color:#555;font-size:13px;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;color:#1A1A2E;font-size:13px;word-break:break-word;vertical-align:top;">${value}</td>
    </tr>`,
    )
    .join("");

  const inner = `
    <!-- Badge + Heading -->
    <tr>
      <td style="padding:32px 32px 20px;">
        <div style="display:inline-block;background:#FFF3E0;color:#E65100;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">
          📋 New Volunteer Application
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:24px;font-weight:800;line-height:1.2;">New Application Received</h2>
        <p style="color:#666;font-size:15px;line-height:1.7;margin-top:10px;">
          A new volunteer application has been submitted on the <strong>Humanity Calls</strong> platform. 
          Please review the applicant's details below and take appropriate action in the admin dashboard.
        </p>
      </td>
    </tr>

    <!-- Details Table -->
    <tr>
      <td style="padding:0 32px 32px;">
        <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C62828;">Applicant Details</p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid #EEF0F6;border-radius:12px;overflow:hidden;">
          ${rows}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:0 32px 36px;text-align:center;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/dashboard"
          style="display:inline-block;background:#C62828;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
          Review in Admin Dashboard →
        </a>
      </td>
    </tr>
  `;

  return wrap(inner, `New volunteer application from ${vol.fullName}`);
};

/**
 * Template 2 — Volunteer notification: application approved
 */
export const volunteerApprovalTemplate = (vol, frontendUrl, password) => {
  const profileUrl = `${frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173"}/profile`;

  const inner = `
    <!-- Hero -->
    <tr>
      <td style="padding:40px 32px 16px;text-align:center;">
        <div style="width:72px;height:72px;background:#E8F5E9;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px;line-height:72px;">
          🎉
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:28px;font-weight:900;line-height:1.2;">Congratulations!</h2>
        <p style="margin:16px 0 0;color:#C62828;font-size:18px;font-weight:700;">Dear ${vol.fullName},</p>
        <p style="color:#555;font-size:16px;line-height:1.7;margin:14px 0 0;">
          You have been <strong style="color:#2E7D32;">approved as a Volunteer</strong> at Humanity Calls Trust. 
          We are thrilled to have you on board and look forward to working with you!
        </p>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="padding:16px 32px;"><div style="border-top:2px dashed #EEF0F6;"></div></td></tr>

    <!-- Volunteer ID Card -->
    <tr>
      <td style="padding:0 32px 24px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#C62828 0%,#8B0000 100%);border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Your Volunteer ID</p>
              <p style="margin:0;color:#ffffff;font-size:30px;font-weight:900;letter-spacing:3px;font-family:monospace;">${vol.volunteerId}</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Humanity Calls Trust&reg;</p>
            </td>
            <td style="padding:24px 28px;text-align:right;vertical-align:middle;">
              <img src="${LOGO_URL}" width="48" height="48" alt="HC" style="display:inline-block;border-radius:12px;background:rgba(255,255,255,0.15);padding:4px;">
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Basic Details -->
    <tr>
      <td style="padding:0 32px 24px;">
        <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C62828;">Volunteer Details</p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid #EEF0F6;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;font-weight:600;color:#555;font-size:13px;width:40%;">Email</td>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;color:#1A1A2E;font-size:13px;font-weight:700;">${vol.email}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;">Volunteer ID</td>
            <td style="padding:12px 16px;color:#1A1A2E;font-size:13px;font-weight:700;">${vol.volunteerId}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Message -->
    <tr>
      <td style="padding:0 32px 28px;">
        <div style="background:#F0FFF4;border-left:4px solid #2E7D32;border-radius:0 10px 10px 0;padding:18px 20px;">
          <p style="margin:0;color:#1B5E20;font-size:14px;line-height:1.7;">
            🌟 Welcome to the <strong>Humanity Calls</strong> family! You can now download your official 
            Volunteer Membership Card from your profile page. Present it during volunteering activities.
          </p>
        </div>
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td style="padding:0 32px 40px;text-align:center;">
        <a href="${profileUrl}"
          style="display:inline-block;background:#C62828;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:800;font-size:16px;letter-spacing:0.3px;margin-bottom:12px;">
          🪪 Download Your Membership Card
        </a>
        <p style="margin:14px 0 0;color:#999;font-size:12px;">
          Visit your profile at: <a href="${profileUrl}" style="color:#C62828;">${profileUrl}</a>
        </p>
      </td>
    </tr>
  `;

  return wrap(
    inner,
    `Congratulations! You are approved as a Humanity Calls Volunteer`,
  );
};

/**
 * Template 3 — Birthday notification: wishing the volunteer a happy birthday
 */
export const birthdayWishTemplate = (volunteerName) => {
  const celebrateImg =
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80";
  const inner = `
    <tr>
      <td style="padding:0;">
        <img src="${celebrateImg}" alt="Birthday wishes" style="width:100%;max-width:620px;display:block;height:auto;border-bottom:4px solid #C62828;" />
      </td>
    </tr>
    <!-- Transactional-style Message Content -->
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="color:#333333;font-size:16px;line-height:1.6;">
          <p style="margin-top:0;">Warm Birthday Wishes to you! 🎂</p>
          
          <p>Dear <strong>${volunteerName}</strong>,</p>
          
          <p>On behalf of <strong>Humanity Calls</strong>, we sincerely thank you for the time, compassion, and dedication you bring in creating a positive change in society. Your efforts truly reflect the spirit of humanity, and your contribution continues to inspire many.</p>
          
          <p>On your special day, we wish you happiness, good health, and continued strength to keep making a difference. May your journey be filled with purpose, kindness, and success.</p>
          
          <p>Thank you for being a valuable part of <strong>Humanity Calls</strong>.</p>
          
          <p>Wishing you a wonderful year ahead!</p>
          
          <p style="margin-top:24px;">Warm regards,</p>
          <p style="margin:4px 0 0;font-weight:700;">Team Humanity Calls</p>
        </div>
      </td>
    </tr>
  `;

  return wrap(inner, `Happy Birthday Wishes from Humanity Calls 🎉`);
};

/**
 * Template 4 — Generic Mass Email: For admin-sent bulk notifications
 */
export const genericMassEmailTemplate = (name, heading, body, bannerImage) => {
  const inner = `
    ${
      bannerImage
        ? `
    <!-- Banner Image -->
    <tr>
      <td style="padding:0;">
        <img src="${bannerImage}" alt="Banner" style="width:100%;max-width:620px;display:block;height:auto;" />
      </td>
    </tr>
    `
        : ""
    }
    
    <!-- Content Section -->
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="color:#333333;font-size:16px;line-height:1.6;">
          <h2 style="margin:0 0 16px;color:#1A1A2E;font-size:24px;font-weight:900;line-height:1.3;letter-spacing:-0.02em;">${heading}</h2>
          
          <p style="margin:0 0 24px;">Dear <strong>${name}</strong>,</p>
          
          <div style="margin-bottom:32px;color:#444444;">
            ${body}
          </div>
          
          <div style="margin-top:40px;padding-top:24px;border-top:1px solid #EEF0F6;">
            <p style="margin:0;font-size:14px;color:#666;">With Gratitude,</p>
            <p style="margin:6px 0 0;font-weight:800;color:#C62828;font-size:16px;">Team Humanity Calls Trust</p>
          </div>
        </div>
      </td>
    </tr>
  `;

  return wrap(inner, heading);
};

const statusUpdateInner = ({ subject, lines }) => {
  const body = (lines || [])
    .map(
      (l) =>
        `<p style="margin:0 0 14px;color:#333;font-size:16px;line-height:1.7;">${l}</p>`,
    )
    .join("");

  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="display:inline-block;background:#EEF2FF;color:#3730A3;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px;">
          Profile Status Update
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:24px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">
          ${subject}
        </h2>
        <div style="margin-top:18px;">
          ${body}
        </div>
        <div style="margin-top:26px;padding-top:20px;border-top:1px solid #EEF0F6;">
          <p style="margin:0;color:#333;font-size:16px;line-height:1.7;">Warm regards,</p>
          <p style="margin:6px 0 0;font-weight:900;color:#C62828;font-size:16px;">HCT Team</p>
        </div>
      </td>
    </tr>
  `;

  return wrap(inner, subject);
};

export const activeToTemporaryTemplate = (supportEmail) =>
  statusUpdateInner({
    subject: "Profile Status Update – Moved to Temporary",
    lines: [
      "Dear Member,",
      "We noticed that you have not been active for the past 60 days. As a result, your profile has been automatically moved from Active to Temporary status.",
      "Your presence and contribution are valuable to us, and we encourage you to reconnect and continue making a positive impact in the community.",
      `For any clarification or to reactivate your status, please write to the HCT Team at ${supportEmail}.`,
    ],
  });

export const temporaryToInactiveTemplate = (supportEmail) =>
  statusUpdateInner({
    subject: "Profile Status Update – Moved to Inactive",
    lines: [
      "Dear Member,",
      "Since there has been no participation or contribution to our initiatives for the past 90 days, your profile has now been moved from Temporary to Inactive status.",
      "Every effort matters in building a better society, and we truly value your involvement. We would be happy to welcome you back whenever you are ready to contribute again.",
      `For further information or assistance, please contact the HCT Team at ${supportEmail}.`,
    ],
  });

export const temporaryToActiveTemplate = () =>
  statusUpdateInner({
    subject: "Congratulations! You’re Now an Active Member",
    lines: [
      "Dear Member,",
      "Congratulations!",
      "Your recent contributions and active participation are creating a meaningful impact in the community. Because of your efforts, your profile has been successfully moved from Temporary to Active status.",
      "Your dedication proves that even a single step forward can bring significant change to society. We are proud to have you as a full-time Active Member.",
      "Keep inspiring and making a difference!",
    ],
  });

export const profilePictureRemovedByAdminTemplate = (memberName) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="color:#333;font-size:16px;line-height:1.7;">
          <p style="margin-top:0;">Dear <strong>${memberName}</strong>,</p>
          <p>Your profile photo on the Humanity Calls platform was removed by an administrator because it did not meet our guidelines.</p>
          <p>Please sign in to your profile and upload a clear, appropriate photo at your earliest convenience.</p>
          <p style="margin-bottom:0;">Thank you for helping us keep our community respectful and professional.</p>
          <p style="margin-top:24px;margin-bottom:0;">Warm regards,<br><strong>Team Humanity Calls</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Profile photo update requested");
};

export const profilePictureReplacedByAdminTemplate = (memberName) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="color:#333;font-size:16px;line-height:1.7;">
          <p style="margin-top:0;">Dear <strong>${memberName}</strong>,</p>
          <p>Your profile photo on the Humanity Calls platform was updated by an administrator with an approved image.</p>
          <p>If you have any questions, please reply to our support mailbox or contact your coordinator.</p>
          <p style="margin-bottom:0;">Thank you for being part of Humanity Calls.</p>
          <p style="margin-top:24px;margin-bottom:0;">Warm regards,<br><strong>Team Humanity Calls</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Your profile photo was updated");
};

export const profilePictureReuploadRequestedByAdminTemplate = (memberName) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="color:#333;font-size:16px;line-height:1.7;">
          <p style="margin-top:0;">Dear <strong>${memberName}</strong>,</p>
          <p>Our team needs a clearer profile photo for your volunteer record. Please sign in, open your profile, and upload a new image or document we can use for verification.</p>
          <p style="margin-bottom:0;">If you need help, reply to this thread or contact your coordinator.</p>
          <p style="margin-top:24px;margin-bottom:0;">Warm regards,<br><strong>Team Humanity Calls</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Please re-upload your profile photo");
};

export const reimbursementApprovedTemplate = (memberName, amount) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="display:inline-block;background:#ECFDF5;color:#047857;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px;">
          Reimbursement Approved
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:24px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">
          Thanks for spending out of pocket
        </h2>
        <div style="margin-top:18px;color:#333;font-size:16px;line-height:1.7;">
          <p style="margin:0 0 14px;">Dear ${memberName || "Member"},</p>
          <p style="margin:0 0 14px;">
            Thank you for spending while volunteering. Your reimbursement request is approved and your amount of
            <strong> ₹${amount} </strong> will be reimbursed within <strong>7 - 14 working days</strong>.
          </p>
          <p style="margin:0 0 14px;">Warm regards,<br><strong>HCT Team</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Reimbursement Approved");
};

/**
 * Template 6 — Volunteer notification: application rejected
 */
export const volunteerRejectionTemplate = (volName, reason) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="display:inline-block;background:#FEF2F2;color:#991B1B;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px;">
          Application Update
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:24px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">
          Regarding your Volunteer Application
        </h2>
        <div style="margin-top:18px;color:#333;font-size:16px;line-height:1.7;">
          <p style="margin:0 0 14px;">Dear ${volName},</p>
          <p style="margin:0 0 14px;">
            Thank you for your interest in volunteering with <strong>Humanity Calls Trust</strong>. 
            We have carefully reviewed your application.
          </p>
          <p style="margin:0 0 14px;">
            At this time, we are unable to proceed with your application. 
            ${reason ? `<strong>Reason:</strong> ${reason}` : ""}
          </p>
          <p style="margin:0 0 14px;">
            We appreciate your intent to contribute and encourage you to continue your noble efforts in other capacities.
          </p>
          <p style="margin:0 0 14px;">Warm regards,<br><strong>Team Humanity Calls</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Volunteer Application Update");
};

/**
 * Template 7 — Volunteer notification: account banned
 */
export const volunteerBannedTemplate = (volName, reason) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="display:inline-block;background:#7F1D1D;color:#ffffff;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px;">
          Account Restricted
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:24px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">
          Your Account has been Banned
        </h2>
        <div style="margin-top:18px;color:#333;font-size:16px;line-height:1.7;">
          <p style="margin:0 0 14px;">Dear ${volName},</p>
          <p style="margin:0 0 14px;">
            We are writing to inform you that your volunteer account at <strong>Humanity Calls Trust</strong> has been banned.
          </p>
          <p style="margin:0 0 14px;background:#FEF2F2;padding:12px;border-left:4px solid #B91C1C;color:#B91C1C;">
            <strong>Important:</strong> You can no longer access your account or use your volunteer login credentials.
          </p>
          ${reason ? `<p style="margin:0 0 14px;"><strong>Reason for Ban:</strong> ${reason}</p>` : ""}
          <p style="margin:0 0 14px;">
            If you believe this is a mistake, please contact the HCT Team immediately.
          </p>
          <p style="margin:0 0 14px;">Regards,<br><strong>Team Humanity Calls</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Account Ban Notification");
};

/**
 * Template 8 — Volunteer notification: account moved to inactive
 */
export const volunteerInactiveTemplate = (volName) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="display:inline-block;background:#4B5563;color:#ffffff;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px;">
          Status Update
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:24px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">
          Your Profile is now Inactive
        </h2>
        <div style="margin-top:18px;color:#333;font-size:16px;line-height:1.7;">
          <p style="margin:0 0 14px;">Dear ${volName},</p>
          <p style="margin:0 0 14px;">
            Your profile status at <strong>Humanity Calls Trust</strong> has been moved to <strong>Inactive</strong>.
          </p>
          <p style="margin:0 0 14px;background:#F9FAFB;padding:12px;border-left:4px solid #4B5563;color:#4B5563;">
            <strong>Notice:</strong> Your login access remains active. You can still log in to view your profile and history, though you may have limited access to active volunteer activities while in this status.
          </p>
          <p style="margin:0 0 14px;">
            To reactivate your account, please reach out to our team.
          </p>
          <p style="margin:0 0 14px;">Regards,<br><strong>Team Humanity Calls</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Account Deactivation Notification");
};

/**
 * Template 9 — Donation notification: thank you for donation
 */
export const donationThankYouTemplate = (donorName, amount) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;text-align:center;">
        <div style="width:80px;height:80px;background:#FEF2F2;border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;font-size:40px;line-height:80px;">
          ❤️
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:30px;font-weight:900;line-height:1.2;letter-spacing:-0.03em;">
          Thank You for Your Donation!
        </h2>
        <p style="margin:20px 0 0;color:#C62828;font-size:20px;font-weight:700;">Dear ${donorName},</p>
        <p style="color:#555;font-size:16px;line-height:1.7;margin:16px 0 0;">
          We are deeply grateful for your generous contribution of <strong>₹${amount}</strong> to <strong>Humanity Calls Trust</strong>. 
          Your support is vital in our mission of "Helping Humanity, Saving Lives".
        </p>
      </td>
    </tr>

    <!-- Message Block -->
    <tr>
      <td style="padding:0 32px 32px;">
        <div style="background:#FFF9F9;border:1px solid #FFE4E4;border-radius:16px;padding:24px;text-align:center;">
          <p style="margin:0;color:#991B1B;font-size:15px;line-height:1.6;font-weight:600;">
            Every single donation helps us provide blood to those in need, rescue animals, and support the poor and needy. 
            You are a hero in someone's story today!
          </p>
        </div>
      </td>
    </tr>

    <!-- Closing -->
    <tr>
      <td style="padding:0 32px 40px;text-align:center;">
        <p style="margin:0;color:#666;font-size:15px;line-height:1.6;">
          An official receipt will be generated and shared with you shortly if applicable. 
          Thank you once again for your kindness.
        </p>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #EEF0F6;">
          <p style="margin:0;font-size:14px;color:#888;">With Heartfelt Gratitude,</p>
          <p style="margin:6px 0 0;font-weight:900;color:#C62828;font-size:18px;">Team Humanity Calls Trust</p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, `A Heartfelt Thank You, ${donorName}! ❤️`);
};

export const reimbursementPaidTemplate = (memberName, amount) => {
  const inner = `
    <tr>
      <td style="padding:40px 32px 40px;">
        <div style="display:inline-block;background:#E0E7FF;color:#4338CA;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px;">
          Payment Successful
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:24px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">
          Your Reimbursement has been Paid!
        </h2>
        <div style="margin-top:18px;color:#333;font-size:16px;line-height:1.7;">
          <p style="margin:0 0 14px;">Dear ${memberName || "Member"},</p>
          <p style="margin:0 0 14px;">
            Great news! Your reimbursement request for <strong> ₹${amount} </strong> has been successfully processed and the payment has been initiated/completed.
          </p>
          <div style="background:#F3F4F6;padding:16px;border-radius:12px;margin-bottom:14px;">
            <p style="margin:0;color:#4B5563;font-size:13px;">
              <strong>Note:</strong> It might take some time for the funds to reflect in your account depending on your bank's processing cycle.
            </p>
          </div>
          <p style="margin:0 0 14px;">Thank you for your selfless service and dedication to the cause.</p>
          <p style="margin:0 0 14px;">Warm regards,<br><strong>HCT Team</strong></p>
        </div>
      </td>
    </tr>
  `;
  return wrap(inner, "Reimbursement Payment Successful");
};
