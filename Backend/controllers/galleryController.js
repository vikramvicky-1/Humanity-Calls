import Gallery from "../models/Gallery.js";
import { v2 as cloudinary } from "cloudinary";

// @desc    Get all gallery images or filter by project
// @route   GET /api/gallery
export const getGallery = async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = projectId ? { projectId } : {};
    const images = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Upload image to gallery
// @route   POST /api/gallery/upload
export const uploadImage = async (req, res) => {
  try {
    const { projectId, eventDate } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const newImage = new Gallery({
      imageUrl: req.file.path,
      publicId: req.file.filename,
      projectId: projectId || "general",
      eventDate: eventDate || null,
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};

// @desc    Delete image from gallery
// @route   DELETE /api/gallery/:id
export const deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
    // Delete from Database
    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: "Image removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// @desc    Update image details
// @route   PUT /api/gallery/:id
export const updateImage = async (req, res) => {
  try {
    const { projectId, eventDate } = req.body;
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    image.projectId = projectId || image.projectId;
    image.eventDate = eventDate || image.eventDate;

    await image.save();
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
