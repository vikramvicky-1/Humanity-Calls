import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  FaPlusCircle, FaImages, FaGripVertical, FaCrop, FaTimes 
} from "react-icons/fa";
import { PROGRAMS } from "../../constants";

const AddGalleryManager = () => {
  const navigate = useNavigate();
  const [imageItems, setImageItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetId, setCropTargetId] = useState(null);
  const [cropSrc, setCropSrc] = useState("");
  const [crop, setCrop] = useState({ unit: "%", width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const cropImgRef = useRef(null);

  // Drag state
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newItems = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      croppedBlob: null,
    }));
    setImageItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImageItems((prev) => prev.filter((item) => item.id !== id));
  };

  const openCrop = (item) => {
    setCropTargetId(item.id);
    setCropSrc(item.preview);
    setCrop({ unit: "%", width: 80, height: 80, x: 10, y: 10 });
    setCompletedCrop(null);
    setCropModalOpen(true);
  };

  const getCroppedBlob = () => {
    return new Promise((resolve, reject) => {
      const image = cropImgRef.current;
      if (!image || !completedCrop) return reject(new Error("No crop"));
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0, 0,
        canvas.width, canvas.height
      );
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas empty")), "image/jpeg", 0.95);
    });
  };

  const applyCrop = async () => {
    if (!completedCrop || !cropImgRef.current) {
      toast.error("Please select a crop area first");
      return;
    }
    try {
      const blob = await getCroppedBlob();
      setImageItems((prev) =>
        prev.map((item) =>
          item.id === cropTargetId
            ? { ...item, croppedBlob: blob, preview: URL.createObjectURL(blob) }
            : item
        )
      );
      setCropModalOpen(false);
    } catch {
      toast.error("Crop failed");
    }
  };

  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOver.current = idx; };
  const handleDragEnd = () => {
    const items = [...imageItems];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOver.current, 0, dragged);
    dragItem.current = null;
    dragOver.current = null;
    setImageItems(items);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (imageItems.length === 0 || !selectedProject) {
      toast.error("Please select at least one image and a project");
      return;
    }
    setIsUploading(true);
    const token = sessionStorage.getItem("adminToken");
    try {
      const uploadPromises = imageItems.map((item) => {
        const formData = new FormData();
        formData.append("image", item.croppedBlob || item.file, item.file.name);
        formData.append("projectId", selectedProject);
        if (eventDate) formData.append("eventDate", eventDate);
        return axios.post(
          `${import.meta.env.VITE_API_URL}/gallery/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );
      });
      await Promise.all(uploadPromises);
      toast.success(`${imageItems.length} image(s) uploaded successfully!`);
      setSelectedProject("");
      setEventDate("");
      setImageItems([]);
      navigate("/admin/gallery");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
        <FaPlusCircle /> Add Image to Gallery
      </h2>
      <form onSubmit={handleUpload} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-text-body uppercase tracking-widest">
              Select Image(s)
            </label>
            {imageItems.length > 0 && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {imageItems.length} image{imageItems.length > 1 ? "s" : ""} — drag to reorder
              </span>
            )}
          </div>

          {imageItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imageItems.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary/40 transition-all group shadow-sm cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={item.preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/40 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaGripVertical size={10} />
                  </div>
                  <button
                    type="button"
                    onClick={() => openCrop(item)}
                    className="absolute top-1 right-8 bg-blue-500 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                    title="Crop image"
                  >
                    <FaCrop size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(item.id)}
                    className="absolute top-1 right-1 bg-blood text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blood/80"
                    title="Remove image"
                  >
                    <FaTimes size={10} />
                  </button>
                  {item.croppedBlob && (
                    <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[9px] font-bold rounded px-1.5 py-0.5">
                      Cropped
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] font-bold rounded px-1.5 py-0.5">
                    #{idx + 1}
                  </div>
                </div>
              ))}
              <label
                htmlFor="image-upload-more"
                className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary/50 bg-bg/30 hover:bg-bg hover:border-primary/60 transition-all cursor-pointer"
              >
                <FaPlusCircle size={22} />
                <span className="text-[11px] font-bold mt-1">Add More</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload-more"
                disabled={isUploading}
              />
            </div>
          )}

          {imageItems.length === 0 && (
            <div className="relative group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed border-primary/20 rounded-3xl bg-bg/30 cursor-pointer hover:bg-bg/50 hover:border-primary/40 transition-all p-6"
              >
                <div className="flex flex-col items-center gap-3 text-text-body/40">
                  <FaImages size={48} />
                  <span className="font-medium text-center">Click to upload images or drag and drop</span>
                  <span className="text-xs">PNG, JPG up to 10MB each</span>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-text-body uppercase tracking-widest">
            Select Project
          </label>
          <select
            required
            disabled={isUploading}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-6 py-4 border border-border bg-bg/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Choose a project...</option>
            {PROGRAMS.map((program) => (
              <option key={program.id} value={program.id}>
                {program.id.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </option>
            ))}
            <option value="general">General Events</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-text-body uppercase tracking-widest">
            Date of Event
          </label>
          <input
            required
            type="date"
            disabled={isUploading}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            min="1990-01-01"
            max={new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split("T")[0]}
            className="w-full px-6 py-4 border border-border bg-bg/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading || imageItems.length === 0}
          className="w-full bg-primary text-white font-bold py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] uppercase tracking-widest text-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : `Upload ${imageItems.length > 1 ? `${imageItems.length} Images` : "Image"}`}
        </button>
      </form>

      {/* Crop Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <FaCrop /> Free Crop — drag handles to resize
              </h3>
              <button
                onClick={() => setCropModalOpen(false)}
                className="p-2 hover:bg-bg rounded-xl transition-colors text-text-body/40 hover:text-text-body"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex justify-center items-center bg-[#111] p-4" style={{ minHeight: "360px", maxHeight: "60vh", overflow: "auto" }}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                style={{ maxWidth: "100%" }}
              >
                <img
                  ref={cropImgRef}
                  src={cropSrc}
                  alt="Crop preview"
                  style={{ maxWidth: "100%", maxHeight: "55vh", display: "block" }}
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setCropModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-text-body/60 hover:bg-bg transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all text-sm"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGalleryManager;
