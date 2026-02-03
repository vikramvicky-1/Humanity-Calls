import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaImages,
  FaPlusCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaTrashAlt,
} from "react-icons/fa";
import hclogo from "../assets/humanitycallslogo.avif";
import { PROGRAMS } from "../constants";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = ({ defaultTab }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab || "add-gallery");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  const [selectedProject, setSelectedProject] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFilter, setGalleryFilter] = useState("");
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "gallery") {
      fetchGallery();
    }
  }, [activeTab, galleryFilter]);

  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const url = galleryFilter
        ? `${import.meta.env.VITE_API_URL}/gallery?projectId=${galleryFilter}`
        : `${import.meta.env.VITE_API_URL}/gallery`;
      const response = await axios.get(url);
      setGalleryImages(response.data);
    } catch (err) {
      toast.error("Failed to fetch gallery");
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    toast.info("Logged out successfully");
    navigate("/admin/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !selectedProject) {
      toast.error("Please select an image and a project");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("projectId", selectedProject);
    if (eventDate) {
      formData.append("eventDate", eventDate);
    }

    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/gallery/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Image uploaded successfully!");
      // Reset form
      setSelectedProject("");
      setEventDate("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;

    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/gallery/${imageToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Image deleted successfully");
      fetchGallery();
      setShowDeleteModal(false);
      setImageToDelete(null);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (id) => {
    setImageToDelete(id);
    setShowDeleteModal(true);
  };

  const menuItems = [
    { id: "gallery", label: "Gallery", icon: <FaImages /> },
    { id: "add-gallery", label: "Add Gallery", icon: <FaPlusCircle /> },
  ];

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      {/* Admin Navbar */}
      <nav className="bg-white border-b border-border px-[5%] py-4 flex items-center justify-between z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <button
            className="lg:hidden text-primary p-2 hover:bg-bg rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars size={24} />
          </button>
          <div className="flex items-center gap-4">
            <img
              src={hclogo}
              width="50"
              height="50"
              className="object-contain"
              alt="Humanity Calls logo"
            />
            <span className="text-2xl font-black text-blood tracking-tighter hidden sm:block">
              Humanity Calls
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-blood font-bold hover:bg-blood/5 px-6 py-2.5 border border-blood/20 rounded-xl transition-all text-sm uppercase tracking-widest active:scale-95"
        >
          <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:relative inset-y-0 left-0 w-64 bg-white border-r border-border z-[100] transform transition-transform duration-300 ease-in-out shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="p-6 lg:hidden flex justify-between items-center border-b border-border mb-4">
            <span className="font-bold text-primary">Admin Menu</span>
            <button
              className="p-2 hover:bg-bg rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all
                  ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-text-body/60 hover:bg-bg hover:text-primary"
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col">
          <div className="p-6 md:p-10 lg:p-12 flex-grow">
            <div className="max-w-6xl mx-auto w-full">
              {activeTab === "add-gallery" ? (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
                    <FaPlusCircle /> Add Image to Gallery
                  </h2>

                  <form onSubmit={handleUpload} className="space-y-8">
                    {/* Image Upload Area */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-text-body uppercase tracking-widest">
                        Select Image
                      </label>
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                          required
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl transition-all overflow-hidden ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-bg/50 group-hover:border-primary/40"
                          } ${preview ? "border-primary/20" : "border-primary/20 bg-bg/30"}`}
                        >
                          {preview ? (
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-3 text-text-body/40">
                              <FaImages size={48} />
                              <span className="font-medium">
                                Click to upload or drag and drop
                              </span>
                              <span className="text-xs">
                                PNG, JPG up to 10MB
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Project Selector */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-text-body uppercase tracking-widest">
                        Select Project
                      </label>
                      <div className="relative">
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
                              {program.id
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </option>
                          ))}
                          <option value="general">General Events</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-body/40">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Event Date Selector */}
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
                        className="w-full px-6 py-4 border border-border bg-bg/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-primary text-white font-bold py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] uppercase tracking-widest text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center gap-3">
                          <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Uploading...
                        </span>
                      ) : (
                        "Upload Image"
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
                      <FaImages /> Gallery
                    </h2>

                    <select
                      value={galleryFilter}
                      onChange={(e) => setGalleryFilter(e.target.value)}
                      className="px-6 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                    >
                      <option value="">All Projects</option>
                      {PROGRAMS.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.id
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </option>
                      ))}
                      <option value="general">General Events</option>
                    </select>
                  </div>

                  {isLoadingGallery ? (
                    <div className="py-24 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-text-body/60 font-medium italic">
                        Loading gallery...
                      </p>
                    </div>
                  ) : galleryImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {galleryImages.map((img) => (
                        <div
                          key={img._id}
                          className="group relative aspect-video rounded-2xl overflow-hidden border border-border bg-bg shadow-sm hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedImage(img.imageUrl)}
                        >
                          <img
                            src={img.imageUrl}
                            alt="Gallery"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {img.eventDate && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-black/40 backdrop-blur-md text-[8px] font-bold text-white px-2 py-1 rounded-md uppercase tracking-wider border border-white/10">
                                {new Date(img.eventDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(img._id);
                              }}
                              className="bg-blood text-white p-2 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all z-10 opacity-0 group-hover:opacity-100"
                              title="Delete Image"
                            >
                              <FaTrashAlt size={14} />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold text-primary px-2 py-1 rounded-md uppercase tracking-wider">
                              {img.projectId.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center">
                      <FaImages
                        size={64}
                        className="mx-auto text-primary/10 mb-6"
                      />
                      <h3 className="text-2xl font-bold text-text-body mb-2">
                        No images found
                      </h3>
                      <p className="text-text-body/60 italic">
                        Upload some images to see them here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl border border-border animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-blood/10 text-blood rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTrashAlt size={32} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                Confirm Delete
              </h3>
              <p className="text-text-body/70 mb-8">
                Are you sure you want to delete this image? This action cannot
                be undone.
              </p>
              <div className="flex gap-4">
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-text-body/60 hover:bg-bg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 rounded-xl bg-blood text-white font-bold hover:bg-blood/90 transition-all shadow-lg shadow-blood/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
