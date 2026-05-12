import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FaCheck, FaTimes, FaSearchPlus } from "react-icons/fa";

const MAX_OUTPUT = 2000;

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop, fileName = "license.jpg") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  let { width, height } = pixelCrop;
  const scale = Math.min(1, MAX_OUTPUT / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  });
}

/**
 * Rectangular crop for DL / ID documents (4:3). Optional title for a11y.
 */
const LicenseImageCropper = ({ imageSrc, onCropDone, onCancel, title = "Crop license photo" }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(file);
    } catch (err) {
      console.error("License crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[520] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[min(92vh,900px)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-800 uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              4:3 frame · Drag · Pinch or slider to zoom
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="Cancel"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="relative w-full bg-neutral-900 shrink-0" style={{ height: "min(52vh, 360px)" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: "2px solid #fff",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              },
            }}
          />
        </div>

        <div className="px-4 sm:px-6 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <FaSearchPlus className="text-gray-400 text-sm shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary bg-gray-200"
            />
            <span className="text-[10px] font-bold text-gray-400 w-8 text-right shrink-0">{zoom.toFixed(1)}x</span>
          </div>
        </div>

        <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing}
            className="flex-[2] py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <FaCheck size={12} /> Use photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicenseImageCropper;
