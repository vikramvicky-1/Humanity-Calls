import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateIdCard = async (volunteer) => {
  let browser;

  try {
    const templatePath = path.join(__dirname, "../IdCardTemplate/idcard.html");

    const bgPath = path.join(__dirname, "../IdCardTemplate/assets/idbg.png");

    let html = fs.readFileSync(templatePath, "utf-8");

    // Convert background to base64 (important for production)
    const bgImage = fs.readFileSync(bgPath);
    const bgBase64 = `data:image/png;base64,${bgImage.toString("base64")}`;

    // ===== Dynamic Font Logic =====
    const baseFontSize = 24;
    const maxChars = 12;
    const nameLength = volunteer.fullName.length;

    let finalFontSize = baseFontSize;

    if (nameLength > maxChars) {
      finalFontSize = baseFontSize - (nameLength - maxChars);
    }

    if (finalFontSize < 14) {
      finalFontSize = 14;
    }

    // ===== QR Code =====
    const qrData = `https://humanitycalls.org/verify/${volunteer.volunteerId}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // ===== Ensure Profile Picture is Valid =====
    const profileImage = volunteer.profilePicture?.startsWith("http")
      ? volunteer.profilePicture
      : "";

    // ===== Inject Data =====
    html = html
      .replace("{{profilePicture}}", profileImage)
      .replace("{{fullName}}", volunteer.fullName)
      .replace("{{volunteerId}}", volunteer.volunteerId)
      .replace("{{qrCode}}", qrCodeImage)
      .replace("./Assets/idbg.png", bgBase64)
      .replace("assets/idbg.png", bgBase64)
      .replace(".name {", `.name { font-size: ${finalFontSize}px;`);

    // ===== Launch Puppeteer (Render Safe) =====
    browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--disable-extensions",
      ],
      defaultViewport: {
        width: 700,
        height: 542,
        deviceScaleFactor: 2,
      },
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 700,
      height: 542,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      width: "700px",
      height: "542px",
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("❌ ID Card Generation Failed:", error);

    if (browser) {
      await browser.close();
    }

    throw new Error("PDF generation failed");
  }
};
