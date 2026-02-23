import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateIdCard = async (volunteer) => {
  const templatePath = path.join(__dirname, "../IdCardTemplate/Idcard.html");
  const bgPath = path.join(__dirname, "../IdCardTemplate/assets/idbg.png");

  let html = fs.readFileSync(templatePath, "utf-8");

  // Read BG image and convert to base64 for reliable loading
  const bgImage = fs.readFileSync(bgPath);
  const bgBase64 = `data:image/png;base64,${bgImage.toString("base64")}`;

  // ===== Dynamic Font Calculation =====
  const baseFontSize = 24;
  const maxChars = 12;
  const nameLength = volunteer.fullName.length;

  let finalFontSize = baseFontSize;

  if (nameLength > maxChars) {
    finalFontSize = baseFontSize - (nameLength - maxChars);
  }

  // Prevent too small
  if (finalFontSize < 14) {
    finalFontSize = 14;
  }

  // ===== Generate QR Code =====
  const qrData = `https://humanitycalls.org/verify/${volunteer.volunteerId}`;
  const qrCodeImage = await QRCode.toDataURL(qrData);

  // ===== Inject Data =====
  html = html
    .replace("{{profilePicture}}", volunteer.profilePicture)
    .replace("{{fullName}}", volunteer.fullName)
    .replace("{{volunteerId}}", volunteer.volunteerId)
    .replace("{{qrCode}}", qrCodeImage)
    .replace("./Assets/idbg.png", bgBase64)
    .replace(".name {", `.name { font-size: ${finalFontSize}px;`);

  // ===== Launch Puppeteer =====
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set content with "load" instead of "networkidle0" to avoid timeouts with large base64 strings
  await page.setContent(html, {
    waitUntil: "load",
    timeout: 60000, // Increase timeout to 60s
  });

  // Set viewport to match card dimensions for high quality
  await page.setViewport({
    width: 700,
    height: 542,
    deviceScaleFactor: 2,
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
};
