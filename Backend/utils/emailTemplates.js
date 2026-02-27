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
    ["Time Commitment", formatArray(vol.timeCommitment)],
    ["Working Mode", formatArray(vol.workingMode)],
    ["Role Preference", formatArray(vol.rolePreference)],
  ]
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;font-weight:600;color:#555;font-size:13px;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;color:#1A1A2E;font-size:13px;word-break:break-word;vertical-align:top;">${value}</td>
    </tr>`
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
export const volunteerApprovalTemplate = (vol, frontendUrl) => {
  const profileUrl = `${frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173"}/profile`;

  const inner = `
    <!-- Hero -->
    <tr>
      <td style="padding:40px 32px 16px;text-align:center;">
        <div style="width:72px;height:72px;background:#E8F5E9;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px;line-height:72px;">
          🎉
        </div>
        <h2 style="margin:0;color:#1A1A2E;font-size:28px;font-weight:900;line-height:1.2;">Congratulations, ${vol.fullName}!</h2>
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
        <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C62828;">Your Details</p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid #EEF0F6;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;font-weight:600;color:#555;font-size:13px;width:40%;">Name</td>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;color:#1A1A2E;font-size:13px;font-weight:700;">${vol.fullName}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;font-weight:600;color:#555;font-size:13px;">Email</td>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;color:#1A1A2E;font-size:13px;">${vol.email}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;font-weight:600;color:#555;font-size:13px;">Phone</td>
            <td style="padding:12px 16px;border-bottom:1px solid #EEF0F6;color:#1A1A2E;font-size:13px;">${vol.phone}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;">Interest Area</td>
            <td style="padding:12px 16px;color:#1A1A2E;font-size:13px;">${vol.interest || "N/A"}</td>
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
    `Congratulations! You are approved as a Humanity Calls Volunteer`
  );
};
