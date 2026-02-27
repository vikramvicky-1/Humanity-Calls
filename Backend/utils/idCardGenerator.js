/**
 * idCardGenerator.js
 *
 * Generates the volunteer ID card PDF using pdf-lib — no browser, no Chrome.
 * Works locally AND on Render / any Node.js host.
 */

import {
  PDFDocument,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  clip,
  endPath,
  concatTransformationMatrix,
  drawObject,
  drawEllipsePath,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Fetch URL → Uint8Array ───────────────────────────────────────────────────
async function fetchBytes(url, timeoutMs = 8000) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: timeoutMs });
  return new Uint8Array(res.data);
}

// ─── Embed PNG then JPEG fallback ────────────────────────────────────────────
async function embedImg(pdfDoc, bytes) {
  try { return await pdfDoc.embedPng(bytes); } catch {}
  try { return await pdfDoc.embedJpg(bytes); } catch {}
  return null;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export const generateIdCard = async (volunteer) => {
  const W = 700, H = 542;

  // ── 1. Fetch all assets in parallel ────────────────────────────────────────
  const BG_URL =
    "https://res.cloudinary.com/dsryaajna/image/upload/v1772193889/Vikram_V_S_qmnk2w.png";

  const [bgBytes, qrDataUrl, profileBytes] = await Promise.all([
    fetchBytes(BG_URL).catch(() => {
      const fb = path.join(__dirname, "../IdCardTemplate/assets/idbg.png");
      return fs.existsSync(fb) ? new Uint8Array(fs.readFileSync(fb)) : null;
    }),
    QRCode.toDataURL(
      `https://humanitycalls.org/verify/${volunteer.volunteerId}`,
      { margin: 1, width: 150, errorCorrectionLevel: "M" }
    ),
    volunteer.profilePicture?.startsWith("http")
      ? fetchBytes(volunteer.profilePicture).catch(() => null)
      : Promise.resolve(null),
  ]);

  // ── 2. Create PDF ──────────────────────────────────────────────────────────
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([W, H]);

  // ── 3. Background (full bleed) ─────────────────────────────────────────────
  if (bgBytes) {
    const img = await embedImg(pdfDoc, bgBytes);
    if (img) page.drawImage(img, { x: 0, y: 0, width: W, height: H });
  }

  // ── 4. Profile picture — circular clip ────────────────────────────────────
  // HTML/CSS: top:274 left:111, size:118×118
  const PL = 111, PS = 118;
  const PY = H - 274 - PS;   // CSS top → PDF bottom-origin
  const PR = PS / 2;
  const PCX = PL + PR, PCY = PY + PR;

  if (profileBytes) {
    const profImg = await embedImg(pdfDoc, profileBytes);
    if (profImg) {
      // Register image as XObject so we can draw it via drawObject
      const imgName = page.node.newXObject("ProfImg", profImg.ref);

      page.pushOperators(
        // Save state
        pushGraphicsState(),
        // Set circle clip path using drawEllipsePath (built-in pdf-lib helper)
        ...drawEllipsePath({ x: PCX, y: PCY, xScale: PR, yScale: PR }),
        clip(),
        endPath(),
        // Place image: scale PS×PS then translate to position (PL, PY)
        concatTransformationMatrix(PS, 0, 0, PS, PL, PY),
        drawObject(imgName),
        // Restore state → removes clip
        popGraphicsState(),
      );
    }
  }

  // ── 5. QR Code ─────────────────────────────────────────────────────────────
  // HTML/CSS: bottom:11 right:269.5, size:72×72
  const QS = 72;
  const QX = W - 264 - QS;
  const QY = 11;
  const qrImg = await pdfDoc.embedPng(
    new Uint8Array(Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64"))
  );
  page.drawImage(qrImg, { x: QX, y: QY, width: QS, height: QS });

  // ── 6. Text ────────────────────────────────────────────────────────────────
  // HTML/CSS: .details { top:455 left:95 width:175 height:80 }
  const DL = 95, DW = 175;
  const DY = H - 455 - 80;

  const boldFont    = await pdfDoc.embedFont("Helvetica-Bold");
  const regularFont = await pdfDoc.embedFont("Helvetica");

  // Dynamic font size for long names
  const nameLen      = volunteer.fullName.length;
  const nameFontSize = nameLen > 12 ? Math.max(10, 16 - (nameLen - 12) * 0.9) : 16;

  // Centred name
  const nameW = boldFont.widthOfTextAtSize(volunteer.fullName, nameFontSize);
  page.drawText(volunteer.fullName, {
    x: DL + (DW - nameW) / 2,
    y: DY + 46,
    size: nameFontSize,
    font: boldFont,
    color: rgb(0x2a / 255, 0x3f / 255, 0x83 / 255),
  });

  // Centred volunteer ID
  const ID_SZ = 11;
  const idW   = regularFont.widthOfTextAtSize(volunteer.volunteerId, ID_SZ);
  page.drawText(volunteer.volunteerId, {
    x: DL + (DW - idW) / 2,
    y: DY + 28,
    size: ID_SZ,
    font: regularFont,
    color: rgb(0x37 / 255, 0x44 / 255, 0x70 / 255),
  });

  // Emergency contact (if present)
  if (volunteer.emergencyContact) {
    const EC_SZ = 8.5;
    const ecLabel = `Emergency: ${volunteer.emergencyContact}`;
    const ecW = regularFont.widthOfTextAtSize(ecLabel, EC_SZ);
    page.drawText(ecLabel, {
      x: DL + (DW - ecW) / 2,
      y: DY + 12,
      size: EC_SZ,
      font: regularFont,
      color: rgb(0.45, 0.18, 0.18),
    });
  }

  // Disclaimer — two lines matching the HTML template
  const warnColor = rgb(0.35, 0.35, 0.35);
  const WARN_SIZE = 7.5;
  const WARN_X = 450;
  page.drawText("This ID is electronically generated", {
    x: WARN_X, y: 36, size: WARN_SIZE, font: regularFont, color: warnColor,
  });
  page.drawText("and strictly non-transferable.", {
    x: WARN_X, y: 26, size: WARN_SIZE, font: regularFont, color: warnColor,
  });

  // ── 7. Return Buffer ───────────────────────────────────────────────────────
  return Buffer.from(await pdfDoc.save());
};
