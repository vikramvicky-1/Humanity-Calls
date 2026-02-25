import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared browser instance for faster subsequent runs
let sharedBrowser = null;

const getBrowser = async () => {
  if (sharedBrowser && sharedBrowser.connected) return sharedBrowser;
  sharedBrowser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--disable-extensions",
    ],
  });
  return sharedBrowser;
};

export const generateIdCard = async (volunteer) => {
  try {
    const templatePath = path.join(__dirname, "../IdCardTemplate/idcard.html");
    const newBgUrl = "https://res.cloudinary.com/dsryaajna/image/upload/v1772033964/idbg_1_qawbyt.png";

    const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // Parallelize all async data gathering
    const [bgBase64, qrCodeImage, profileImageBase64] = await Promise.all([
      // Background Image
      (async () => {
        try {
          const res = await axios.get(newBgUrl, { responseType: "arraybuffer", timeout: 8000 });
          return `data:${res.headers["content-type"]};base64,${Buffer.from(res.data).toString("base64")}`;
        } catch (e) {
          console.error("BG fetch error, using fallback");
          const bgPath = path.join(__dirname, "../IdCardTemplate/assets/idbg.png");
          return `data:image/png;base64,${fs.readFileSync(bgPath).toString("base64")}`;
        }
      })(),
      // QR Code
      QRCode.toDataURL(`https://humanitycalls.org/verify/${volunteer.volunteerId}`, { margin: 1, width: 150 }),
      // Profile Picture
      (async () => {
        if (!volunteer.profilePicture?.startsWith("http")) return "";
        try {
          const res = await axios.get(volunteer.profilePicture, { responseType: "arraybuffer", timeout: 8000 });
          return `data:${res.headers["content-type"]};base64,${Buffer.from(res.data).toString("base64")}`;
        } catch (e) {
          console.error("Profile fetch error");
          return "";
        }
      })()
    ]);

    // ===== Dynamic Font Logic =====
    const baseFontSize = 24;
    const maxChars = 12;
    const nameLength = volunteer.fullName.length;
    const finalFontSize = nameLength > maxChars ? Math.max(14, baseFontSize - (nameLength - maxChars)) : baseFontSize;

    // Inject data into HTML
    const html = htmlTemplate
      .replace("{{profilePicture}}", profileImageBase64)
      .replace("{{bgBase64}}", bgBase64)
      .replace("{{fullName}}", volunteer.fullName)
      .replace("{{volunteerId}}", volunteer.volunteerId)
      .replace("{{qrCode}}", qrCodeImage)
      .replace(".name {", `.name { font-size: ${finalFontSize}px;`)
      // Add strict @page styling to the injected HTML to prevent extra pages
      .replace("</head>", `
        <style>
          @page { 
            size: 700px 542px; 
            margin: 0 !important; 
          }
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 700px !important;
            height: 542px !important;
            overflow: hidden !important; 
            -webkit-print-color-adjust: exact;
          }
          .card {
            margin: 0 !important;
            padding: 0 !important;
          }
        </style>
      </head>`);

    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      // Set precise viewport
      await page.setViewport({ width: 700, height: 542, deviceScaleFactor: 2 });
      
      // Load content
      await page.setContent(html, { waitUntil: "load" });

      const pdfBuffer = await page.pdf({
        width: "700px",
        height: "542px",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      });

      return pdfBuffer;
    } finally {
      await page.close();
    }
  } catch (error) {
    console.error("❌ ID Card Generation Failed:", error);
    throw new Error("PDF generation failed");
  }
};
