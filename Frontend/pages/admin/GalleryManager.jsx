import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaImages, FaEdit, FaBan, FaCheck, FaTimes, FaPlus, FaCamera, FaGripLines } from "react-icons/fa";
import CarouselImageCropper from "../../components/CarouselImageCropper";
import SortableCarouselItem from "../../components/SortableCarouselItem";
import { PROGRAMS } from "../../constants";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

const GalleryManager = () => {
  const [activeTab, setActiveTab] = useState("gallery");
  const [galleryImages, setGalleryImages] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    projectId: "",
    eventDate: "",
  });

  // Carousel specific states
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingCarousel, setIsUploadingCarousel] = useState(false);
  const [isDeletingCarousel, setIsDeletingCarousel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (activeTab === "gallery") fetchGallery();
    else fetchCarousel();
  }, [activeTab, galleryFilter]);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const url = galleryFilter
        ? `${import.meta.env.VITE_API_URL}/gallery?projectId=${galleryFilter}`
        : `${import.meta.env.VITE_API_URL}/gallery`;
      const response = await axios.get(url);
      setGalleryImages(response.data);
    } catch (err) {
      toast.error("Failed to fetch gallery");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarousel = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/carousel`);
      setCarouselImages(response.data);
    } catch (err) {
      toast.error("Failed to fetch carousel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(`${import.meta.env.VITE_API_URL}/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Image deleted successfully");
      fetchGallery();
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };

  const openEditModal = (img) => {
    setImageToEdit(img);
    setEditFormData({
      projectId: img.projectId || "",
      eventDate: img.eventDate ? new Date(img.eventDate).toISOString().split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/gallery/${imageToEdit._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Image details updated");
      setShowEditModal(false);
      fetchGallery();
    } catch (err) {
      toast.error("Failed to update image");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDeleteCarouselImage = async () => {
    if (!itemToDelete || isDeletingCarousel) return;
    if (carouselImages.length <= 1) {
      toast.warning("At least one image must remain in the carousel.");
      setShowDeleteConfirm(false);
      return;
    }
    
    setIsDeletingCarousel(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(`${import.meta.env.VITE_API_URL}/carousel/${itemToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Carousel image deleted");
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      fetchCarousel();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image");
    } finally {
      setIsDeletingCarousel(false);
    }
  };

  const confirmDelete = (img) => {
    setItemToDelete(img);
    setShowDeleteConfirm(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = carouselImages.findIndex((i) => i._id === active.id);
    const newIndex = carouselImages.findIndex((i) => i._id === over.id);
    const newItems = arrayMove(carouselImages, oldIndex, newIndex);
    
    setCarouselImages(newItems);
    
    // Update backend (outside state updater to avoid double calls)
    syncReorder(newItems);
  };

  const syncReorder = async (newItems) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const ids = newItems.map(i => i._id);
      await axios.put(`${import.meta.env.VITE_API_URL}/carousel/reorder`, { ids }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order saved");
    } catch (err) {
      toast.error("Failed to sync order with server");
      fetchCarousel(); // Revert to server state
    }
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSelectedImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      setShowCropModal(true);
    }
  };

  const handleCropDone = async (croppedFile) => {
    setIsUploadingCarousel(true);
    try {
      const formData = new FormData();
      formData.append("image", croppedFile);
      
      const token = sessionStorage.getItem("adminToken");
      await axios.post(`${import.meta.env.VITE_API_URL}/carousel/upload`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        },
      });
      
      toast.success("Carousel image uploaded successfully!");
      setShowCropModal(false);
      setSelectedImage(null);
      fetchCarousel();
    } catch (err) {
      toast.error("Failed to upload carousel image");
    } finally {
      setIsUploadingCarousel(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tabs Header */}
      <div className="flex border-b border-border bg-gray-50/50">
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === "gallery" 
              ? "bg-white text-primary border-b-2 border-primary" 
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
          }`}
        >
          Gallery Images
        </button>
        <button
          onClick={() => setActiveTab("carousel")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === "carousel" 
              ? "bg-white text-primary border-b-2 border-primary" 
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
          }`}
        >
          Home Carousel
        </button>
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            {activeTab === "gallery" ? <FaImages /> : <FaCamera />} 
            {activeTab === "gallery" ? "Gallery Management" : "Home Carousel"}
          </h2>
          
          {activeTab === "gallery" ? (
            <select
              value={galleryFilter}
              onChange={(e) => setGalleryFilter(e.target.value)}
              className="px-6 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
            >
              <option value="">All Projects</option>
              {PROGRAMS.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.id.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </option>
              ))}
              <option value="general">General Events</option>
            </select>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
                id="carousel-upload"
              />
              <label
                htmlFor="carousel-upload"
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
              >
                <FaPlus size={14} /> Add Carousel Image
              </label>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-body/60 font-medium italic">Loading...</p>
          </div>
        ) : activeTab === "gallery" ? (
          /* Gallery Tab Content */
          galleryImages.filter(img => img.projectId !== 'volunteer').length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryImages
                .filter(img => img.projectId !== 'volunteer')
                .map((img) => (
                <div
                  key={img._id}
                  className="group relative aspect-video rounded-2xl overflow-hidden border border-border bg-bg shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={img.imageUrl}
                    alt="Gallery"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <div className="flex justify-between items-start">
                      <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {img.projectId?.replace(/_/g, " ")}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(img)}
                          className="bg-white text-primary p-2 rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all"
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(img._id)}
                          className="bg-white text-blood p-2 rounded-lg shadow-lg hover:bg-blood hover:text-white transition-all"
                          title="Delete"
                        >
                          <FaBan size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-white text-[10px] font-bold bg-black/40 backdrop-blur-xs p-1.5 rounded-lg w-fit">
                      {img.eventDate ? new Date(img.eventDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <FaImages size={64} className="mx-auto text-primary/10 mb-6" />
              <h3 className="text-2xl font-bold text-text-body mb-2">No images found</h3>
            </div>
          )
        ) : (
          /* Carousel Tab Content */
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center justify-between">
              <p className="text-xs text-primary/70 font-medium">
                <strong>Tip:</strong> Drag the <FaGripLines className="inline mx-1" /> handle to reorder. 16:9 widescreen fit is enforced. Min 1 image required.
              </p>
              <span className="text-[10px] bg-white text-primary border border-primary/20 font-bold px-2 py-1 rounded-lg">
                DRAG TO REORDER
              </span>
            </div>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={carouselImages.map((img) => img._id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {carouselImages.map((img, index) => (
                    <SortableCarouselItem 
                      key={img._id}
                      img={img}
                      index={index}
                      confirmDelete={confirmDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Existing Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
            <h3 className="text-2xl font-bold text-primary mb-6">Edit Image Info</h3>
            <form onSubmit={handleUpdateImage} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-body/40">Project</label>
                <select
                  value={editFormData.projectId}
                  onChange={(e) => setEditFormData({ ...editFormData, projectId: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary"
                  required
                >
                  <option value="">Select Project</option>
                  {PROGRAMS.map((p) => <option key={p.id} value={p.id}>{p.id.replace(/_/g, " ")}</option>)}
                  <option value="general">General</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-body/40">Event Date</label>
                <input
                  type="date"
                  value={editFormData.eventDate}
                  onChange={(e) => setEditFormData({ ...editFormData, eventDate: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-border rounded-xl font-bold hover:bg-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-blood/10 text-blood rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBan size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Delete Image?</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to remove this image from the homepage carousel? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                disabled={isDeletingCarousel}
                className="flex-1 py-3.5 border border-border rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCarouselImage}
                disabled={isDeletingCarousel}
                className="flex-2 py-3.5 bg-blood text-white rounded-2xl font-bold shadow-lg shadow-blood/20 hover:bg-blood/90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeletingCarousel ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Crop Modal */}
      {showCropModal && selectedImage && (
        <CarouselImageCropper
          imageSrc={selectedImage}
          onCropDone={handleCropDone}
          isUploading={isUploadingCarousel}
          onCancel={() => {
            setShowCropModal(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
};

export default GalleryManager;
