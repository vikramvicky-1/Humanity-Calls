import React, { useState, useEffect, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useNavigate } from "react-router-dom";
import {
  FaImages,
  FaPlusCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaEdit,
  FaUserFriends,
  FaClipboardList,
  FaCheck,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaSearch,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaTrash,
  FaCrop,
  FaGripVertical,
} from "react-icons/fa";
import hclogo from "../assets/humanitycallslogo.avif";
import { PROGRAMS } from "../constants";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminDashboard = ({ defaultTab }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab || "volunteers");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Always open by default on desktop
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Gallery State
  const [selectedProject, setSelectedProject] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFilter, setGalleryFilter] = useState("");
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  // Each item: { id, file, preview, croppedBlob }
  const [imageItems, setImageItems] = useState([]);
  // Crop modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetId, setCropTargetId] = useState(null);
  const [cropSrc, setCropSrc] = useState("");
  const [crop, setCrop] = useState({ unit: "%", width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const cropImgRef = useRef(null);
  // Drag state
  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    projectId: "",
    eventDate: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Volunteer State
  const [volunteers, setVolunteers] = useState([]);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);
  const [volunteerStatusTab, setVolunteerStatusTab] = useState("active");
  const [showVolunteerEditModal, setShowVolunteerEditModal] = useState(false);
  const [volunteerToEdit, setVolunteerToEdit] = useState(null);
  const [isUpdatingVolunteer, setIsUpdatingVolunteer] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [selectedVolunteerDetails, setSelectedVolunteerDetails] = useState(null);
  const [selectedIdImage, setSelectedIdImage] = useState("");
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Search and Export States
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [approvedVolunteer, setApprovedVolunteer] = useState(null);

  // Reason Modal State
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonData, setReasonData] = useState({ id: "", status: "", reason: "" });

  // Delete Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
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
    } else if (activeTab === "volunteers") {
      fetchVolunteers(volunteerStatusTab);
    } else if (activeTab === "requests") {
      fetchVolunteers("pending");
    }
    fetchPendingCount();
  }, [activeTab, galleryFilter, volunteerStatusTab]);

  const fetchPendingCount = async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/volunteers?status=pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPendingRequestsCount(response.data.length);
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

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

  const fetchVolunteers = async (status) => {
    setIsLoadingVolunteers(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const url = status
        ? `${import.meta.env.VITE_API_URL}/volunteers?status=${status}`
        : `${import.meta.env.VITE_API_URL}/volunteers`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVolunteers(response.data);
    } catch (err) {
      toast.error("Failed to fetch volunteers");
    } finally {
      setIsLoadingVolunteers(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    toast.info("Logged out successfully");
    navigate("/admin/login");
  };

  // Gallery Handlers
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
    // Reset input so same files can be re-selected
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
        // Use croppedBlob if available, otherwise original file
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
      setActiveTab("gallery");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const openEditModal = (img) => {
    setImageToEdit(img._id);
    setEditFormData({
      projectId: img.projectId,
      eventDate: img.eventDate
        ? new Date(img.eventDate).toISOString().split("T")[0]
        : "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/gallery/${imageToEdit}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Image details updated successfully");
      fetchGallery();
      setShowEditModal(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
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
      toast.error("Delete failed");
    }
  };

  // Volunteer Handlers
  const handleVolunteerStatus = async (id, status, reason = "") => {
    if ((status === "rejected" || status === "banned") && !reason) {
      setReasonData({ id, status, reason: "" });
      setShowReasonModal(true);
      return;
    }

    setIsUpdatingVolunteer(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/volunteers/status/${id}`,
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Volunteer status updated to ${status}`);
      
      if (status === "active") {
        setApprovedVolunteer(response.data.volunteer);
        setShowApprovalPopup(true);
      }

      fetchPendingCount();
      setShowReasonModal(false);
      if (activeTab === "requests") {
        fetchVolunteers("pending");
      } else {
        fetchVolunteers(volunteerStatusTab);
      }
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      setIsUpdatingVolunteer(false);
    }
  };

  const openVolunteerEditModal = (vol) => {
    setVolunteerToEdit({ ...vol });
    setShowVolunteerEditModal(true);
  };

  const handleVolunteerUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingVolunteer(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/volunteers/${volunteerToEdit._id}`,
        volunteerToEdit,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Volunteer details updated successfully");
      fetchVolunteers(volunteerStatusTab);
      setShowVolunteerEditModal(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsUpdatingVolunteer(false);
    }
  };

  const handleDeleteVolunteer = async () => {
    if (!volunteerToDelete) return;
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/volunteers/${volunteerToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Volunteer completely removed from database");
      setShowDeleteModal(false);
      setVolunteerToDelete(null);
      fetchPendingCount();
      if (activeTab === "requests") {
        fetchVolunteers("pending");
      } else {
        fetchVolunteers(volunteerStatusTab);
      }
    } catch (err) {
      toast.error("Failed to delete volunteer");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVolunteers = volunteers.filter((vol) =>
    vol.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vol.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vol.phone?.includes(searchQuery) ||
    vol.volunteerId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleExportExcel = () => {
    const dataToExport = filteredVolunteers.map((vol) => ({
      "Volunteer ID": vol.volunteerId || "N/A",
      "Full Name": vol.fullName,
      Email: vol.email,
      Phone: vol.phone,
      Gender: vol.gender || "N/A",
      "DOB (Age)": vol.dob ? `${new Date(vol.dob).toLocaleDateString("en-GB")} (${calculateAge(vol.dob)}Y)` : "N/A",
      "Blood Group": vol.bloodGroup,
      "Joined Date": vol.joiningDate
        ? new Date(vol.joiningDate).toLocaleDateString("en-GB")
        : "N/A",
      "Gov ID Type": vol.govIdType,
      Interest: vol.interest,
      Occupation: vol.occupation === "Other" ? vol.occupationDetail : vol.occupation,
      Skills: vol.skills,
      "Time Commitment": Array.isArray(vol.timeCommitment) ? vol.timeCommitment.join(", ") : vol.timeCommitment,
      "Working Mode": Array.isArray(vol.workingMode) ? vol.workingMode.join(", ") : vol.workingMode,
      "Role Preference": Array.isArray(vol.rolePreference) ? vol.rolePreference.join(", ") : vol.rolePreference,
      Status: vol.status,
      Reason: vol.rejectionReason || vol.banReason || "",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Volunteers");
    XLSX.writeFile(
      wb,
      `Volunteers_${activeTab === "requests" ? "pending" : volunteerStatusTab}_${new Date().toLocaleDateString()}.xlsx`,
    );
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4"); // Landscape for more columns
    doc.text(
      `Volunteers Report - ${activeTab === "requests" ? "pending" : volunteerStatusTab}`,
      14,
      15,
    );

    const tableColumn = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Interest",
      "Occupation",
      "Skills",
      "Time",
      "Mode",
      "Role",
      "Status",
    ];
    const tableRows = filteredVolunteers.map((vol) => [
      vol.volunteerId || "N/A",
      vol.fullName,
      vol.email,
      vol.phone,
      vol.interest,
      vol.occupation === "Other" ? vol.occupationDetail : vol.occupation,
      vol.skills,
      Array.isArray(vol.timeCommitment) ? vol.timeCommitment.join(", ") : vol.timeCommitment,
      Array.isArray(vol.workingMode) ? vol.workingMode.join(", ") : vol.workingMode,
      Array.isArray(vol.rolePreference) ? vol.rolePreference.join(", ") : vol.rolePreference,
      vol.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 6 },
    });
    doc.save(
      `Volunteers_${activeTab === "requests" ? "pending" : volunteerStatusTab}_${new Date().toLocaleDateString()}.pdf`,
    );
    setShowExportModal(false);
  };

  const menuItems = [
    { id: "volunteers", label: "Volunteers", icon: <FaUserFriends /> },
    { id: "requests", label: "Volunteer Requests", icon: <FaClipboardList /> },
    { id: "gallery", label: "Gallery", icon: <FaImages /> },
    { id: "add-gallery", label: "Add Gallery", icon: <FaPlusCircle /> },
  ];

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-border px-[5%] py-4 flex items-center justify-between z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <button
            className="lg:hidden text-primary p-2 hover:bg-bg rounded-lg transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
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
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm font-bold text-text-body/60 uppercase tracking-widest">
            Admin Portal
          </span>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Collapsible Sidebar */}
        <aside
          className={`
          fixed lg:relative inset-y-0 left-0 bg-white border-r border-border z-[100] transform transition-all duration-300 ease-in-out shrink-0 flex flex-col
          ${isSidebarOpen ? "w-64" : "w-20"}
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="p-6 flex justify-between items-center border-b border-border shrink-0">
            {isSidebarOpen && (
              <span className="font-bold text-primary">Admin Menu</span>
            )}
            <button
              className="p-2 hover:bg-bg rounded-lg transition-colors text-primary hidden lg:block"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
            <button
              className="lg:hidden text-primary"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>

          <nav className="p-4 space-y-2 flex-grow overflow-y-auto overflow-x-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all
                  ${activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-body/60 hover:bg-bg hover:text-primary"}
                  ${!isSidebarOpen && "justify-center"}
                `}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.id === "requests" && pendingRequestsCount > 0 && (
                      <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-2 shadow-sm">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-blood hover:bg-blood/5 transition-all
                ${!isSidebarOpen && "justify-center"}
              `}
              title="Logout"
            >
              <FaSignOutAlt className="text-xl" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col">
          <div className="p-6 md:p-10 lg:p-12 flex-grow">
            <div className="max-w-6xl mx-auto w-full">
              {activeTab === "volunteers" && (
                <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
                      <FaUserFriends /> Volunteers
                    </h2>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative flex-grow md:flex-grow-0">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/40" />
                        <input
                          type="text"
                          placeholder="Search volunteers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 pr-4 py-2 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full text-sm"
                        />
                      </div>
                      <button
                        onClick={() => setShowExportModal(true)}
                        disabled={filteredVolunteers.length === 0}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaDownload /> Export
                      </button>
                    </div>
                  </div>

                  {/* Single line tabs below heading */}
                  <div className="flex flex-wrap items-center gap-2 mb-8 bg-bg p-1.5 rounded-2xl w-fit">
                    {["active", "banned", "rejected"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setVolunteerStatusTab(tab)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all capitalize flex items-center gap-2 text-sm ${volunteerStatusTab === tab ? "bg-primary text-white shadow-md" : "text-text-body/60 hover:text-primary hover:bg-white"}`}
                      >
                        {tab === "active" && <FaCheck size={12} />}
                        {tab === "banned" && <FaBan size={12} />}
                        {tab === "rejected" && <FaTimes size={12} />}
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="w-full overflow-hidden">
                    {isLoadingVolunteers ? (
                      <div className="py-24 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-text-body/60 font-medium italic">
                          Loading volunteers...
                        </p>
                      </div>
                    ) : filteredVolunteers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border text-text-body/40 text-[11px] uppercase tracking-widest font-bold">
                              <th className="px-4 py-4 text-center">Profile</th>
                              <th className="px-4 py-4">Volunteer Info</th>
                              <th className="px-4 py-4">Contact</th>
                              <th className="px-4 py-4">Gender</th>
                              <th className="px-4 py-4">Details</th>
                              <th className="px-4 py-4">Gov ID</th>
                              <th className="px-4 py-4">Interest</th>
                              {volunteerStatusTab !== "active" && (
                                <th className="px-4 py-4">Reason</th>
                              )}
                              <th className="px-4 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-sm">
                            {filteredVolunteers.map((vol) => (
                              <tr
                                key={vol._id}
                                className="hover:bg-bg/50 transition-colors group"
                              >
                                <td className="px-4 py-4 text-center">
                                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 mx-auto bg-bg shadow-inner group-hover:border-primary/40 transition-all">
                                    {vol.profilePicture ? (
                                      <img src={vol.profilePicture} alt={vol.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-primary/20 bg-bg">
                                        <FaUserFriends size={28} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="font-bold text-text-body text-base">
                                    {vol.fullName}
                                  </div>
                                  {vol.volunteerId && (
                                    <div className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black tracking-widest mt-1 w-fit">
                                      {vol.volunteerId}
                                    </div>
                                  )}
                                  <div className="text-[11px] text-text-body/40 font-medium">
                                    DOB:{" "}
                                    {vol.dob
                                      ? `${new Date(vol.dob).toLocaleDateString("en-GB")} (${calculateAge(vol.dob)}Y)`
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-bold text-text-body/80">
                                    {vol.email}
                                  </div>
                                  <div className="text-[11px] text-text-body/40 font-bold">
                                    {vol.phone}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap font-bold text-text-body/70 uppercase text-xs">
                                  {vol.gender || "N/A"}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-xs font-bold">
                                    BG: <span className="text-blood">{vol.bloodGroup}</span>
                                  </div>
                                  <div className="text-[11px] text-text-body/40 font-medium">
                                    Joined:{" "}
                                    {vol.joiningDate
                                      ? new Date(
                                          vol.joiningDate,
                                        ).toLocaleDateString("en-GB")
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setSelectedIdImage(vol.govIdImage);
                                      setShowIdModal(true);
                                    }}
                                    className="flex items-center gap-2 text-primary hover:underline text-[10px] font-bold"
                                  >
                                    <FaEye /> {vol.govIdType}
                                  </button>
                                </td>
                                <td className="px-4 py-4 text-[10px] font-medium text-text-body/70 whitespace-nowrap">
                                  {vol.interest}
                                </td>
                                {volunteerStatusTab !== "active" && (
                                  <td
                                    className="px-4 py-4 text-[10px] text-blood italic max-w-[150px] truncate"
                                    title={
                                      vol.rejectionReason || vol.banReason
                                    }
                                  >
                                    {vol.rejectionReason ||
                                      vol.banReason ||
                                      "No reason provided"}
                                  </td>
                                )}
                                <td className="px-4 py-4">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedVolunteerDetails(vol);
                                        setShowViewMoreModal(true);
                                      }}
                                      className="text-blue-500 hover:underline text-[11px] font-bold whitespace-nowrap"
                                    >
                                      View More
                                    </button>
                                    {vol.status !== "rejected" && (
                                      <button
                                        onClick={() =>
                                          openVolunteerEditModal(vol)
                                        }
                                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Edit"
                                      >
                                        <FaEdit size={14} />
                                      </button>
                                    )}
                                    {vol.status === "active" && (
                                      <button
                                        onClick={() =>
                                          handleVolunteerStatus(
                                            vol._id,
                                            "banned",
                                          )
                                        }
                                        className="p-1.5 text-blood hover:bg-blood/10 rounded-lg transition-colors"
                                        title="Ban"
                                      >
                                        <FaBan size={14} />
                                      </button>
                                    )}
                                    {vol.status !== "active" &&
                                      vol.status !== "rejected" && (
                                        <button
                                          onClick={() =>
                                            handleVolunteerStatus(
                                              vol._id,
                                              "active",
                                            )
                                          }
                                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                          title="Activate"
                                        >
                                          <FaCheck size={14} />
                                        </button>
                                      )}
                                    <button
                                      onClick={() => {
                                        setVolunteerToDelete(vol);
                                        setShowDeleteModal(true);
                                      }}
                                      className="p-1.5 text-blood hover:bg-blood/10 rounded-lg transition-colors"
                                      title="Delete Completely"
                                    >
                                      <FaTrash size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-24 text-center">
                        <FaUserFriends
                          size={64}
                          className="mx-auto text-primary/10 mb-6"
                        />
                        <h3 className="text-2xl font-bold text-text-body mb-2">
                          No {volunteerStatusTab} volunteers found
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "requests" && (
                <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
                      <FaClipboardList /> Volunteer Requests
                    </h2>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative flex-grow md:flex-grow-0">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/40" />
                        <input
                          type="text"
                          placeholder="Search requests..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 pr-4 py-2 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full text-sm"
                        />
                      </div>
                      <button
                        onClick={() => setShowExportModal(true)}
                        disabled={filteredVolunteers.length === 0}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaDownload /> Export
                      </button>
                    </div>
                  </div>

                  <div className="w-full overflow-hidden">
                    {isLoadingVolunteers ? (
                      <div className="py-24 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-text-body/60 font-medium italic">
                          Loading requests...
                        </p>
                      </div>
                    ) : filteredVolunteers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border text-text-body/40 text-[11px] uppercase tracking-widest font-bold">
                              <th className="px-4 py-4 text-center">Profile</th>
                              <th className="px-4 py-4">Volunteer Info</th>
                              <th className="px-4 py-4">Contact</th>
                              <th className="px-4 py-4">Gender</th>
                              <th className="px-4 py-4">Bio Details</th>
                              <th className="px-4 py-4">Gov ID</th>
                              <th className="px-4 py-4">Interest</th>
                              <th className="px-4 py-4 text-center">Decision</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-sm">
                            {filteredVolunteers.map((vol) => (
                              <tr
                                key={vol._id}
                                className="hover:bg-bg/50 transition-colors group"
                              >
                                <td className="px-4 py-4 text-center">
                                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 mx-auto bg-bg shadow-inner group-hover:border-primary/40 transition-all">
                                    {vol.profilePicture ? (
                                      <img src={vol.profilePicture} alt={vol.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-primary/20 bg-bg">
                                        <FaUserFriends size={28} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="font-bold text-base">{vol.fullName}</div>
                                  <div className="text-[11px] text-text-body/40 font-medium tracking-wider">
                                    DOB:{" "}
                                    {vol.dob
                                      ? `${new Date(vol.dob).toLocaleDateString("en-GB")} (${calculateAge(vol.dob)}Y)`
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-bold">{vol.email}</div>
                                  <div className="text-[11px] text-text-body/40 font-bold">
                                    {vol.phone}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap font-bold text-text-body/70 uppercase text-xs">
                                  {vol.gender || "N/A"}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-xs font-bold">
                                    BG: <span className="text-blood">{vol.bloodGroup}</span>
                                  </div>
                                  <div className="text-[11px] text-text-body/40 font-medium">
                                    Joining:{" "}
                                    {vol.joiningDate
                                      ? new Date(
                                          vol.joiningDate,
                                        ).toLocaleDateString("en-GB")
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setSelectedIdImage(vol.govIdImage);
                                      setShowIdModal(true);
                                    }}
                                    className="flex items-center gap-2 text-primary hover:underline text-xs font-bold"
                                  >
                                    <FaEye /> {vol.govIdType}
                                  </button>
                                </td>
                                <td className="px-4 py-4 text-xs font-medium text-text-body/70 whitespace-nowrap">
                                  {vol.interest}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex justify-center items-center gap-4">
                                    <button
                                      onClick={() => {
                                        setSelectedVolunteerDetails(vol);
                                        setShowViewMoreModal(true);
                                      }}
                                      className="text-blue-500 hover:underline text-[11px] font-bold whitespace-nowrap"
                                    >
                                      View More
                                    </button>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleVolunteerStatus(vol._id, "active")
                                        }
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-all shadow-md shadow-green-200"
                                      >
                                        <FaCheck /> Accept
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleVolunteerStatus(vol._id, "rejected")
                                        }
                                        className="flex items-center gap-2 bg-blood text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blood/90 transition-all shadow-md shadow-blood/20"
                                      >
                                        <FaTimes /> Reject
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setVolunteerToDelete(vol);
                                        setShowDeleteModal(true);
                                      }}
                                      className="p-2 text-blood hover:bg-blood/10 rounded-lg transition-colors"
                                      title="Delete Completely"
                                    >
                                      <FaTrash size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-24 text-center">
                        <FaClipboardList
                          size={64}
                          className="mx-auto text-primary/10 mb-6"
                        />
                        <h3 className="text-2xl font-bold text-text-body mb-2">
                          No pending requests
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "add-gallery" && (
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

                      {/* Image Grid */}
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
                              {/* Drag handle overlay */}
                              <div className="absolute top-1 left-1 bg-black/40 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaGripVertical size={10} />
                              </div>
                              {/* Crop button */}
                              <button
                                type="button"
                                onClick={() => openCrop(item)}
                                className="absolute top-1 right-8 bg-blue-500 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                                title="Crop image"
                              >
                                <FaCrop size={10} />
                              </button>
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => removeImage(item.id)}
                                className="absolute top-1 right-1 bg-blood text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blood/80"
                                title="Remove image"
                              >
                                <FaTimes size={10} />
                              </button>
                              {/* Cropped indicator */}
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
                          {/* Add More tile */}
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

                      {/* Empty state drop zone */}
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
                </div>
              )}

              {activeTab === "gallery" && (
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
                  ) : galleryImages.filter(img => img.projectId !== 'volunteer').length > 0 ? (
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 transition-opacity">
                            <div className="flex justify-between items-start">
                              <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {img.projectId?.replace(/_/g, " ")}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(img);
                                  }}
                                  className="bg-white text-primary p-2 rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all"
                                  title="Edit"
                                >
                                  <FaEdit size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(img._id);
                                  }}
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
                      <FaImages
                        size={64}
                        className="mx-auto text-primary/10 mb-6"
                      />
                      <h3 className="text-2xl font-bold text-text-body mb-2">
                        No images found
                      </h3>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Gov ID Image Modal */}
      {showIdModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden">
            <button
              onClick={() => setShowIdModal(false)}
              className="absolute top-6 right-6 z-10 bg-blood text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              <FaTimes />
            </button>
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
              <img
                src={selectedIdImage}
                alt="Gov ID"
                className="max-w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Approval Success Popup */}
      {showApprovalPopup && approvedVolunteer && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full relative shadow-2xl border border-border animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FaCheck size={40} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Volunteer Added!</h3>
            <p className="text-text-body/60 font-medium mb-8">
              Application approved successfully. A unique ID has been generated for the volunteer.
            </p>
            
            <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl p-6 mb-8">
              <span className="text-xs font-bold text-amber-800/40 uppercase tracking-widest block mb-2">Generated ID</span>
              <span className="text-4xl font-black text-amber-600 tracking-tighter">
                {approvedVolunteer.volunteerId}
              </span>
            </div>

            <button 
              onClick={() => setShowApprovalPopup(false)}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Great, continue
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && volunteerToDelete && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-border animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-blood transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <div className="w-20 h-20 bg-red-100 text-blood rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FaTrash size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Delete Volunteer?
            </h3>
            <p className="text-text-body/60 text-sm mb-6 font-medium text-center">
              Are you sure you want to completely remove{" "}
              <span className="text-primary font-bold">
                {volunteerToDelete.fullName}
              </span>{" "}
              from the database? This action is irreversible and will delete
              their ID, status, and all associated data.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
              <div className="flex gap-3">
                <FaPlusCircle className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed font-medium">
                  <strong>Warning:</strong> The volunteer will have to re-apply
                  completely if they wish to join again. Their current ID (
                  {volunteerToDelete.volunteerId || "Pending"}) will be deleted forever.
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 rounded-xl font-bold text-text-body/60 hover:bg-bg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVolunteer}
                disabled={isDeleting}
                className="flex-1 py-4 bg-blood text-white rounded-xl font-bold shadow-lg shadow-blood/20 hover:bg-blood/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal (For Reject/Ban) */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-border animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowReasonModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-blood transition-colors"><FaTimes size={20} /></button>
            <h3 className="text-2xl font-bold text-primary mb-2 capitalize">{reasonData.status} Volunteer</h3>
            <p className="text-text-body/60 text-sm mb-6 font-medium">Please provide a reason for this decision. This will be shown to the volunteer in their profile.</p>
            
            <textarea
              required
              rows={4}
              value={reasonData.reason}
              onChange={(e) => setReasonData({ ...reasonData, reason: e.target.value })}
              className="w-full px-5 py-3 border border-border bg-bg/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none mb-6"
              placeholder={`Enter reason for ${reasonData.status}...`}
            />

            <div className="flex gap-3">
              <button onClick={() => setShowReasonModal(false)} className="flex-1 py-4 rounded-xl font-bold text-text-body/60 hover:bg-bg transition-all">Cancel</button>
              <button 
                onClick={() => handleVolunteerStatus(reasonData.id, reasonData.status, reasonData.reason)}
                disabled={!reasonData.reason || isUpdatingVolunteer}
                className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${reasonData.status === 'rejected' ? 'bg-blood shadow-blood/20' : 'bg-primary shadow-primary/20'}`}
              >
                {isUpdatingVolunteer ? "Updating..." : `Confirm ${reasonData.status}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Export Data</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-text-body/40 hover:text-blood transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <p className="text-text-body/60 mb-8 font-medium">
              Choose your preferred format to download the volunteer list.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleExportExcel}
                className="flex flex-col items-center gap-4 p-6 border-2 border-green-100 rounded-2xl hover:bg-green-50 hover:border-green-500 transition-all group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <FaFileExcel size={32} />
                </div>
                <span className="font-bold text-green-700">Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex flex-col items-center gap-4 p-6 border-2 border-blood/10 rounded-2xl hover:bg-blood/5 hover:border-blood transition-all group"
              >
                <div className="w-16 h-16 bg-blood/10 rounded-full flex items-center justify-center text-blood group-hover:scale-110 transition-transform">
                  <FaFilePdf size={32} />
                </div>
                <span className="font-bold text-blood">PDF (.pdf)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Edit Modal */}
      {showVolunteerEditModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              !isUpdatingVolunteer && setShowVolunteerEditModal(false)
            }
          />
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full relative z-10 shadow-2xl border border-border animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <FaEdit /> Edit Volunteer Details
            </h3>
            <form
              onSubmit={handleVolunteerUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Full Name (as per Gov ID)
                </label>
                <input
                  required
                  type="text"
                  value={volunteerToEdit.fullName}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={volunteerToEdit.email}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  value={volunteerToEdit.phone}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Gender
                </label>
                <select
                  required
                  value={volunteerToEdit.gender}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      gender: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Date of Birth
                </label>
                <input
                  required
                  type="date"
                  value={volunteerToEdit.dob ? new Date(volunteerToEdit.dob).toISOString().split("T")[0] : ""}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      dob: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  min="1900-01-01"
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Blood Group
                </label>
                <select
                  required
                  value={volunteerToEdit.bloodGroup}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      bloodGroup: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Government ID Type
                </label>
                <select
                  required
                  value={volunteerToEdit.govIdType}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      govIdType: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                >
                  <option value="">Select ID Type</option>
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Area of Interest
                </label>
                <select
                  required
                  value={volunteerToEdit.interest}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      interest: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                >
                  <option value="">Select Interest</option>
                  <option value="Community & Field Engagement">Community & Field Engagement</option>
                  <option value="Education & Skill Development">Education & Skill Development</option>
                  <option value="Health & Well-being">Health & Well-being</option>
                  <option value="Environment & Sustainability">Environment & Sustainability</option>
                  <option value="Creative & Media Support">Creative & Media Support</option>
                  <option value="Administration & Management">Administration & Management</option>
                  <option value="Fundraising & Partnerships">Fundraising & Partnerships</option>
                  <option value="Blood Donation">Blood Donation</option>
                  <option value="Poor/Needy Support">Poor/Needy Support</option>
                  <option value="Animal Rescue">Animal Rescue</option>
                  <option value="Event Organizing">Event Organizing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Occupation
                </label>
                <select
                  required
                  value={volunteerToEdit.occupation}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      occupation: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                >
                  <option value="">Select Occupation</option>
                  <option value="Student (School / College)">Student (School / College)</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Business Owner / Entrepreneur">Business Owner / Entrepreneur</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Retired Professional">Retired Professional</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Government Employee">Government Employee</option>
                  <option value="NGO / Social Sector Professional">NGO / Social Sector Professional</option>
                  <option value="Medical Professional">Medical Professional</option>
                  <option value="Legal Professional">Legal Professional</option>
                  <option value="Educator / Teacher">Educator / Teacher</option>
                  <option value="IT Professional">IT Professional</option>
                  <option value="Other">Other (Please Specify)</option>
                </select>
              </div>
              {volunteerToEdit.occupation === "Other" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                    Specify Occupation
                  </label>
                  <input
                    type="text"
                    value={volunteerToEdit.occupationDetail}
                    onChange={(e) =>
                      setVolunteerToEdit({
                        ...volunteerToEdit,
                        occupationDetail: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                  />
                </div>
              )}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Skills
                </label>
                <input
                  type="text"
                  value={volunteerToEdit.skills}
                  onChange={(e) =>
                    setVolunteerToEdit({
                      ...volunteerToEdit,
                      skills: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-bold text-gray-700 text-sm">Contribute Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-body/40">Time Commitment</label>
                    <div className="flex flex-wrap gap-2">
                      {["One-time Event", "Weekend Volunteer", "Monthly Commitment", "Project-Based", "Long-Term Association"].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={volunteerToEdit.timeCommitment?.includes(opt)}
                            onChange={(e) => {
                              const current = [...(volunteerToEdit.timeCommitment || [])];
                              if (e.target.checked) current.push(opt);
                              else {
                                const i = current.indexOf(opt);
                                if (i > -1) current.splice(i, 1);
                              }
                              setVolunteerToEdit({ ...volunteerToEdit, timeCommitment: current });
                            }}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-body/40">Working Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {["On-ground (Field Work)", "Remote / Online", "Hybrid"].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={volunteerToEdit.workingMode?.includes(opt)}
                            onChange={(e) => {
                              const current = [...(volunteerToEdit.workingMode || [])];
                              if (e.target.checked) current.push(opt);
                              else {
                                const i = current.indexOf(opt);
                                if (i > -1) current.splice(i, 1);
                              }
                              setVolunteerToEdit({ ...volunteerToEdit, workingMode: current });
                            }}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-body/40">Role Preference</label>
                    <div className="flex flex-wrap gap-2">
                      {["Team Member", "Team Leader", "Coordinator", "Consultant / Advisor", "Intern"].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={volunteerToEdit.rolePreference?.includes(opt)}
                            onChange={(e) => {
                              const current = [...(volunteerToEdit.rolePreference || [])];
                              if (e.target.checked) current.push(opt);
                              else {
                                const i = current.indexOf(opt);
                                if (i > -1) current.splice(i, 1);
                              }
                              setVolunteerToEdit({ ...volunteerToEdit, rolePreference: current });
                            }}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowVolunteerEditModal(false)}
                  className="px-8 py-3 rounded-xl font-bold text-text-body/60 hover:bg-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingVolunteer}
                  className="px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                >
                  {isUpdatingVolunteer ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View More Modal */}
      {showViewMoreModal && selectedVolunteerDetails && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowViewMoreModal(false)}
          />
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full relative z-10 shadow-2xl border border-border animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-primary flex items-center gap-3">
                <FaUserFriends size={32} /> Volunteer Profile
              </h3>
              <button
                onClick={() => setShowViewMoreModal(false)}
                className="text-text-body/40 hover:text-blood transition-colors p-2 hover:bg-bg rounded-full"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="aspect-square rounded-3xl overflow-hidden border-4 border-primary/10 bg-bg shadow-inner">
                  {selectedVolunteerDetails.profilePicture ? (
                    <img 
                      src={selectedVolunteerDetails.profilePicture} 
                      alt={selectedVolunteerDetails.fullName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/10">
                      <FaUserFriends size={80} />
                    </div>
                  )}
                </div>
                <div className="bg-bg/50 rounded-2xl p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 mb-1">Status</p>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                      selectedVolunteerDetails.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                      selectedVolunteerDetails.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {selectedVolunteerDetails.status}
                    </span>
                  </div>
                  {selectedVolunteerDetails.volunteerId && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 mb-1">Volunteer ID</p>
                      <p className="font-bold text-primary text-lg tracking-tighter">{selectedVolunteerDetails.volunteerId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  <DetailItem label="Full Name" value={selectedVolunteerDetails.fullName} />
                  <DetailItem label="Email Address" value={selectedVolunteerDetails.email} />
                  <DetailItem label="Phone Number" value={selectedVolunteerDetails.phone} />
                  <DetailItem label="Date of Birth" value={selectedVolunteerDetails.dob ? `${new Date(selectedVolunteerDetails.dob).toLocaleDateString("en-GB")} (${calculateAge(selectedVolunteerDetails.dob)}Y)` : "N/A"} />
                  <DetailItem label="Gender" value={selectedVolunteerDetails.gender} />
                  <DetailItem label="Blood Group" value={selectedVolunteerDetails.bloodGroup} />
                  <DetailItem label="Interest Area" value={selectedVolunteerDetails.interest} />
                  <DetailItem label="Occupation" value={selectedVolunteerDetails.occupation === "Other" ? selectedVolunteerDetails.occupationDetail : selectedVolunteerDetails.occupation} />
                  <div className="sm:col-span-2">
                    <DetailItem label="Skills Offered" value={selectedVolunteerDetails.skills} />
                  </div>
                </div>

                <div className="border-t border-border pt-6 mt-6">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6">Contribution Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DetailList label="Time Commitment" items={selectedVolunteerDetails.timeCommitment} />
                    <DetailList label="Working Mode" items={selectedVolunteerDetails.workingMode} />
                    <DetailList label="Role Preference" items={selectedVolunteerDetails.rolePreference} />
                  </div>
                </div>

                <div className="border-t border-border pt-6 mt-6">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">Identification</h4>
                  <div className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <FaClipboardList size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-body/40">{selectedVolunteerDetails.govIdType}</p>
                        <p className="font-bold text-sm">Government ID Proof</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedIdImage(selectedVolunteerDetails.govIdImage);
                        setShowIdModal(true);
                      }}
                      className="px-6 py-2 bg-white border border-border rounded-xl text-xs font-bold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                    >
                      View ID Image
                    </button>
                  </div>
                </div>

                {(selectedVolunteerDetails.rejectionReason || selectedVolunteerDetails.banReason) && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Notice / Reason</p>
                    <p className="text-sm font-medium text-red-700 leading-relaxed italic">
                      "{selectedVolunteerDetails.rejectionReason || selectedVolunteerDetails.banReason}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isUpdating && setShowEditModal(false)}
          />
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-border animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <FaEdit /> Edit Image Details
            </h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Project
                </label>
                <select
                  value={editFormData.projectId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      projectId: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  {PROGRAMS.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.id.replace("_", " ")}
                    </option>
                  ))}
                  <option value="general">General Events</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-body/60">
                  Date of Event
                </label>
                <input
                  type="date"
                  value={editFormData.eventDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      eventDate: e.target.value,
                    })
                  }
                  min="1990-01-01"
                  max={new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split("T")[0]}
                  className="w-full px-5 py-4 border border-border bg-bg/30 rounded-xl focus:border-primary outline-none transition-all cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-8 py-3 rounded-xl font-bold text-text-body/60 hover:bg-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                >
                  {isUpdating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
            {/* Crop area */}
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

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 mb-1">{label}</p>
    <p className="font-bold text-text-body break-words">{value || 'N/A'}</p>
  </div>
);

const DetailList = ({ label, items }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 mb-3">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items && items.length > 0 ? (
        items.map((item, i) => (
          <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg border border-primary/10 capitalize">
            {item}
          </span>
        ))
      ) : (
        <span className="text-xs text-text-body/40 italic">None selected</span>
      )}
    </div>
  </div>
);

export default AdminDashboard;
