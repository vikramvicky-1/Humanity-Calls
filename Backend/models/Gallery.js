import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery;
