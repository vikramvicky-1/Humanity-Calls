const LOGO_URL =
  "https://res.cloudinary.com/daokrum7i/image/upload/v1768550123/favicon-32x32_kca2tb.png";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("No image"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

/**
 * Client-side fundraiser banner (PNG) — Humanity Calls branding + key facts + optional QR.
 */
export async function downloadEmergencyBannerPng({
  patientImageUrl,
  title,
  patientName,
  targetAmount,
  raisedAmount,
  pendingAmount,
  qrImageUrl,
  filename = "emergency-fundraiser-banner.png",
}) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1a1a2e");
  grad.addColorStop(1, "#4a0d0d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const pad = 48;
  let y = pad;

  try {
    const logo = await loadImage(LOGO_URL);
    const lw = 56;
    ctx.drawImage(logo, pad, y, lw, lw);
  } catch {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px system-ui,sans-serif";
    ctx.fillText("Humanity Calls", pad, y + 36);
  }

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 22px system-ui,sans-serif";
  ctx.fillText("Humanity Calls Trust", pad + 72, y + 38);

  y += 100;

  const photoH = 420;
  if (patientImageUrl) {
    try {
      const ph = await loadImage(patientImageUrl);
      ctx.save();
      ctx.beginPath();
      ctx.rect(pad, y, W - pad * 2, photoH);
      ctx.clip();
      const scale = Math.max((W - pad * 2) / ph.width, photoH / ph.height);
      const dw = ph.width * scale;
      const dh = ph.height * scale;
      const dx = pad + (W - pad * 2 - dw) / 2;
      const dy = y + (photoH - dh) / 2;
      ctx.drawImage(ph, dx, dy, dw, dh);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(pad, y, W - pad * 2, photoH);
    } catch {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(pad, y, W - pad * 2, photoH);
    }
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(pad, y, W - pad * 2, photoH);
  }

  y += photoH + 40;

  ctx.fillStyle = "#ffb4b4";
  ctx.font = "bold 18px system-ui,sans-serif";
  ctx.fillText("EMERGENCY FUNDING", pad, y);
  y += 36;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px system-ui,sans-serif";
  const titleLines = wrapText(ctx, title, W - pad * 2 - (qrImageUrl ? 220 : 0), 46);
  titleLines.forEach((line) => {
    ctx.fillText(line, pad, y);
    y += 52;
  });

  if (patientName) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "26px system-ui,sans-serif";
    ctx.fillText(patientName, pad, y + 8);
    y += 48;
  }

  y += 20;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "28px system-ui,sans-serif";
  ctx.fillText(`Goal: ₹${Number(targetAmount || 0).toLocaleString("en-IN")}`, pad, y);
  y += 44;
  ctx.fillText(`Raised: ₹${Number(raisedAmount || 0).toLocaleString("en-IN")}`, pad, y);
  y += 44;
  ctx.fillStyle = "#fecaca";
  ctx.fillText(`Still needed: ₹${Number(pendingAmount || 0).toLocaleString("en-IN")}`, pad, y);
  y += 60;

  if (qrImageUrl) {
    try {
      const qr = await loadImage(qrImageUrl);
      const qw = 200;
      ctx.fillStyle = "#fff";
      ctx.fillRect(W - pad - qw - 16, y - 200, qw + 32, qw + 56);
      ctx.drawImage(qr, W - pad - qw, y - 184, qw, qw);
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 18px system-ui,sans-serif";
      ctx.fillText("Scan to help", W - pad - qw - 8, y + 12);
    } catch {
      /* skip qr */
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "20px system-ui,sans-serif";
  ctx.fillText("humanitycalls.org", pad, H - pad);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Export failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve();
      },
      "image/png",
      0.92,
    );
  });
}

function wrapText(ctx, text, maxWidth, lineHeight) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 4);
}
