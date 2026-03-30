import Carousel from "../models/Carousel.js";
import { v2 as cloudinary } from "cloudinary";

const INITIAL_CAROUSEL_IMAGES = [
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_60,w_800,c_limit/v1768556077/landing_page3_dlrxfk.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555729/landing_page4_yjkb6r.png",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555360/landing_page2_inavn7.webp",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555429/landing_page5_ebletc.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555357/landing_page8_zcjgcn.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555358/landing_page7_yzqyda.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555359/landing_page6_lvaoju.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555359/landing_page1_jdiydd.jpg",
];

// @desc    Get all carousel images
// @route   GET /api/carousel
export const getCarousel = async (req, res) => {
  try {
    let images = await Carousel.find().sort({ order: 1, createdAt: -1 });
    
    // Seed if empty
    if (images.length === 0) {
      const seedData = INITIAL_CAROUSEL_IMAGES.map((url, index) => ({
        imageUrl: url,
        publicId: `legacy_carousel_${index}`, // Note: These can't be deleted from Cloudinary by us easily if they aren't ours, but we can delete from DB
        title: `Slide ${index + 1}`,
        order: index
      }));
      await Carousel.insertMany(seedData);
      images = await Carousel.find().sort({ order: 1, createdAt: -1 });
    }
    
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Upload image to carousel
// @route   POST /api/carousel/upload
export const uploadCarouselImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const { title, description, order } = req.body;

    const newImage = new Carousel({
      imageUrl: req.file.path,
      publicId: req.file.filename,
      title: title || "",
      description: description || "",
      order: order || 0,
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};

// @desc    Delete image from carousel
// @route   DELETE /api/carousel/:id
export const deleteCarouselImage = async (req, res) => {
  try {
    // Check if it's the last image
    const count = await Carousel.countDocuments();
    if (count <= 1) {
      return res.status(400).json({ message: "At least one image must remain in the carousel." });
    }

    const image = await Carousel.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
    // Delete from Database
    await Carousel.findByIdAndDelete(req.params.id);

    res.json({ message: "Carousel image removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};
// @desc    Update carousel order
// @route   PUT /api/carousel/reorder
export const reorderCarousel = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "Invalid IDs provided" });
  }

  try {
    const bulkOps = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await Carousel.bulkWrite(bulkOps);
    res.json({ message: "Carousel reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update carousel image order/details
// @route   PUT /api/carousel/:id
export const updateCarouselImage = async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const image = await Carousel.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    image.title = title !== undefined ? title : image.title;
    image.description = description !== undefined ? description : image.description;
    image.order = order !== undefined ? order : image.order;

    await image.save();
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
