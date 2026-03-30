import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FaCheck, FaTimes, FaSearchPlus } from "react-icons/fa";

async function getCroppedImg(imageSrc, pixelCrop, fileName = "carousel.jpg") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], fileName, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

const CarouselImageCropper = ({ imageSrc, onCropDone, onCancel, isUploading = false }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (isProcessing || isUploading) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(file);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isAnyLoading = isProcessing || isUploading;

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">
              Crop Carousel Image
            </h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              Strict 16:9 Aspect Ratio · Drag to reposition · Pinch or slide to zoom
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isAnyLoading}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-30"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="relative w-full bg-black mx-auto" style={{ height: 350 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
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

        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <FaSearchPlus className="text-gray-400 text-sm shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={isAnyLoading}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary bg-gray-200"
            />
            <span className="text-[10px] font-bold text-gray-400 w-8 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-3">
          <button
            onClick={onCancel}
            disabled={isAnyLoading}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isAnyLoading}
            className="flex-2 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnyLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isUploading ? "Uploading…" : "Processing…"}
              </>
            ) : (
              <>
                <FaCheck size={12} /> Save for Carousel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarouselImageCropper;
