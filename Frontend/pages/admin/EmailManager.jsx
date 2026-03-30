import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from "dompurify";
import {
  FaEnvelope,
  FaEye,
  FaTimes,
  FaPlusCircle,
  FaCheck,
  FaSearch,
  FaDownload,
  FaTrash,
  FaClipboardList,
  FaHistory,
} from "react-icons/fa";
import { LOGO_URL } from "./AdminComponents";

const EmailPreviewContent = ({ name, heading, body, bannerImage }) => {
  const sanitizedBody = DOMPurify ? DOMPurify.sanitize(body || "") : body || "";
  const year = new Date().getFullYear();
  const socialLinks = [
    { label: "Facebook", href: "https://www.facebook.com/HumanityGcalls/" },
    { label: "Instagram", href: "https://www.instagram.com/humanitycalls_/" },
    { label: "X", href: "https://x.com/Humanitycalls1" },
    { label: "WhatsApp", href: "https://wa.me/918867713031" },
    { label: "Telegram", href: "https://t.me/+Hm9LfMm2fTljZjBl" },
    { label: "YouTube", href: "https://www.youtube.com/@humanitycalls" },
  ];

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#F4F6FB",
        padding: "20px 0",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            backgroundColor: "#C62828",
            padding: "20px 25px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src={LOGO_URL}
            alt="HC"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: "#fff",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: "900",
              color: "#ffffff",
              letterSpacing: "-0.3px",
            }}
          >
            Humanity Calls
          </span>
        </div>
        {bannerImage && (
          <img
            src={bannerImage}
            alt="Banner"
            style={{
              width: "100%",
              display: "block",
              maxHeight: "300px",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            padding: "35px 25px",
            color: "#333333",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              color: "#1A1A2E",
              fontSize: "22px",
              fontWeight: "900",
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </h2>
          <p style={{ margin: "0 0 24px" }}>
            Dear <strong>{name}</strong>,
          </p>
          <div dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
          <div
            style={{
              marginTop: "35px",
              paddingTop: "20px",
              borderTop: "1px solid #EEF0F6",
            }}
          >
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
              With Gratitude,
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontWeight: "800",
                color: "#C62828",
                fontSize: "15px",
              }}
            >
              Team Humanity Calls Trust
            </p>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#1A1A2E",
            padding: "25px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            Humanity Calls Trust&reg;
          </p>
          <p
            style={{
              margin: "6px 0 0",
              color: "#7CA68C",
              fontSize: "12px",
              fontStyle: "italic",
            }}
          >
            "Helping Humanity, Saving Lives"
          </p>
          <div
            style={{
              marginTop: "15px",
              paddingTop: "15px",
              borderTop: "1px solid #2E2E4E",
            }}
          >
            <p style={{ margin: 0, color: "#777", fontSize: "10px" }}>
              &copy; {year} Humanity Calls Trust. All Rights Reserved.
            </p>
            <p style={{ margin: "10px 0 6px", color: "#A7AEC2", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Follow Us
            </p>
            <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.8 }}>
              {socialLinks.map((link, index) => (
                <span key={link.label}>
                  <a href={link.href} style={{ color: "#C9D3FF", textDecoration: "none" }}>
                    {link.label}
                  </a>
                  {index < socialLinks.length - 1 ? <span style={{ color: "#59607A" }}> | </span> : null}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailManager = () => {
  const [mailSubject, setMailSubject] = useState("");
  const [mailHeading, setMailHeading] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [mailBanner, setMailBanner] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedRecipientGroups, setSelectedRecipientGroups] = useState([]);
  const [mailHistory, setMailHistory] = useState([]);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isLoadingMailHistory, setIsLoadingMailHistory] = useState(false);

  // New States for individual selection
  const [potentialRecipients, setPotentialRecipients] = useState({ volunteers: [], users: [] });
  const [selectedIndividualVolunteers, setSelectedIndividualVolunteers] = useState([]);
  const [selectedIndividualUsers, setSelectedIndividualUsers] = useState([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState("");
  const [showIndividualSelection, setShowIndividualSelection] = useState(null); // 'vol' or 'user'

  useEffect(() => {
    fetchMailHistory();
    fetchPotentialRecipients();
  }, []);

  const fetchPotentialRecipients = async () => {
    setIsLoadingRecipients(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/all-potential-recipients`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPotentialRecipients(response.data);
    } catch (err) {
      console.error("Failed to fetch potential recipients", err);
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const fetchMailHistory = async () => {
    setIsLoadingMailHistory(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mass-mail-history`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMailHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch mail history", err);
    } finally {
      setIsLoadingMailHistory(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingBanner(true);
    const token = sessionStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/email/upload-banner`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMailBanner(response.data.imageUrl);
      toast.success("Banner uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Banner upload failed");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSendMassEmail = async (e) => {
    e.preventDefault();
    if (selectedRecipientGroups.length === 0 && selectedIndividualVolunteers.length === 0 && selectedIndividualUsers.length === 0) {
      toast.error("Please select at least one recipient or group");
      return;
    }
    setIsSendingMail(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/send-mass-email`,
        {
          subject: mailSubject,
          heading: mailHeading,
          body: mailBody,
          bannerImage: mailBanner,
          selectedGroups: selectedRecipientGroups,
          selectedIndividualVolunteers,
          selectedIndividualUsers
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Mass email sending initiated!");
      setMailSubject("");
      setMailHeading("");
      setMailBody("");
      setMailBanner("");
      setSelectedRecipientGroups([]);
      setSelectedIndividualVolunteers([]);
      setSelectedIndividualUsers([]);
      fetchMailHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send mass email");
    } finally {
      setIsSendingMail(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
      [{ color: [] }, { background: [] }],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "color",
    "background",
  ];

  const toggleRecipientGroup = (group) => {
    if (selectedRecipientGroups.includes(group)) {
      setSelectedRecipientGroups((prev) => prev.filter((g) => g !== group));
    } else {
      setSelectedRecipientGroups((prev) => [...prev, group]);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-4xl shadow-2xl border border-border/50 overflow-hidden">
        <div className="bg-primary/5 px-8 pt-10 pb-8 border-b border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-primary tracking-tighter flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                <FaEnvelope size={24} />
              </div>
              Mass Mailer
            </h2>
          </div>
          <button
            onClick={() => setShowEmailPreview(!showEmailPreview)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
              showEmailPreview
                ? "bg-blood text-white shadow-blood/20"
                : "bg-white text-primary border border-primary/20 hover:bg-primary/5"
            }`}
          >
            {showEmailPreview ? <FaTimes /> : <FaEye />}
            {showEmailPreview ? "Close Preview" : "Live Preview"}
          </button>
        </div>

        <div
          className={`grid grid-cols-1 ${showEmailPreview ? "lg:grid-cols-2 lg:divide-x" : ""} divide-border/50`}
        >
          <div className="p-8 md:p-10 space-y-10">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-text-body/40 flex justify-between items-baseline">
                Email Banner Image
              </label>
              <div className="relative group rounded-[2rem] overflow-hidden border-2 border-dashed border-primary/20 bg-bg/30 hover:bg-bg/50 transition-all min-h-[12rem] flex items-center justify-center">
                {mailBanner ? (
                  <>
                    <img
                      src={mailBanner}
                      alt="Banner"
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <label
                        htmlFor="banner-replace"
                        className="cursor-pointer bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
                      >
                        Replace
                      </label>
                      <button
                        onClick={() => setMailBanner("")}
                        className="bg-blood text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label
                    htmlFor="banner-upload"
                    className="flex flex-col items-center gap-4 cursor-pointer p-8 group-hover:scale-105 transition-transform"
                  >
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-xl group-hover:shadow-primary/20 transition-all">
                      <FaPlusCircle size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-primary text-lg tracking-tight">
                        Add Visual Impact
                      </p>
                      <p className="text-xs text-text-body/40 font-bold uppercase tracking-widest mt-1">
                        Upload banner image
                      </p>
                    </div>
                  </label>
                )}
                <input
                  type="file"
                  id="banner-upload"
                  onChange={handleBannerUpload}
                  className="hidden"
                  accept="image/*"
                />
                <input
                  type="file"
                  id="banner-replace"
                  onChange={handleBannerUpload}
                  className="hidden"
                  accept="image/*"
                />
                {isUploadingBanner && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm font-black text-primary uppercase tracking-widest">
                      Uploading...
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-text-body/40">
                  Email Subject
                </label>
                <input
                  required
                  type="text"
                  placeholder="Appears in recipient inbox"
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  className="w-full px-7 py-4 border border-border rounded-2xl focus:border-primary outline-none transition-all font-bold text-lg"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-text-body/40">
                  Rich Heading
                </label>
                <input
                  required
                  type="text"
                  placeholder="Main title inside the email"
                  value={mailHeading}
                  onChange={(e) => setMailHeading(e.target.value)}
                  className="w-full px-7 py-4 border border-border rounded-2xl focus:border-primary outline-none transition-all font-bold text-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-text-body/40">
                Message Content
              </label>
              <div className="quill-container bg-white rounded-3xl border border-border overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={mailBody}
                  onChange={setMailBody}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write something impactful..."
                  className="min-h-[250px]"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-text-body/40">
                Target Audience
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "active_volunteers", label: "Active Team", sub: "Individual Selection Available", type: "vol" },
                  { id: "temporary_volunteers", label: "Temp Support", sub: "Individual Selection Available", type: "vol" },
                  { id: "users", label: "Signed-up Users", sub: "Individual Selection Available", type: "user" },
                  { id: "all", label: "Everyone", sub: "Full Broadcast", type: "all" },
                ].map((group) => (
                  <div key={group.id} className="space-y-3">
                    <button
                      type="button"
                      onClick={() => toggleRecipientGroup(group.id)}
                      className={`w-full p-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-between ${
                        selectedRecipientGroups.includes(group.id)
                          ? "bg-primary text-white border-primary shadow-lg scale-[1.02]"
                          : "bg-white text-text-body/60 border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedRecipientGroups.includes(group.id) ? (
                          <div className="bg-white rounded-full p-0.5 text-primary">
                            <FaCheck size={12} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-border" />
                        )}
                        <div className="text-left">
                          <p className="text-sm leading-tight">{group.label}</p>
                          <p className={`text-[10px] uppercase tracking-wider opacity-60 ${selectedRecipientGroups.includes(group.id) ? 'text-white' : 'text-primary'}`}>
                            {group.sub}
                          </p>
                        </div>
                      </div>
                    </button>
                    
                    {group.type !== "all" && (
                      <button
                        type="button"
                        onClick={() => setShowIndividualSelection(showIndividualSelection === group.id ? null : group.id)}
                        className={`w-full text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                          showIndividualSelection === group.id 
                            ? "text-blood bg-blood/5" 
                            : "text-primary/40 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {showIndividualSelection === group.id ? <FaTimes /> : <FaPlusCircle />}
                        {showIndividualSelection === group.id ? "Hide Individuals" : "Select Individuals"}
                        {(group.type === 'vol' ? selectedIndividualVolunteers : selectedIndividualUsers).filter(id => {
                          const item = (group.type === 'vol' ? potentialRecipients.volunteers : potentialRecipients.users).find(p => p.id === id);
                          return group.id === 'users' ? item?.type === 'user' : item?.type === group.id.replace('s', ''); 
                        }).length > 0 && (
                          <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">
                            {(group.type === 'vol' ? selectedIndividualVolunteers : selectedIndividualUsers).filter(id => {
                              const item = (group.type === 'vol' ? potentialRecipients.volunteers : potentialRecipients.users).find(p => p.id === id);
                              if (group.id === 'users') return item?.type === 'user';
                              if (group.id === 'active_volunteers') return item?.type === 'active_vol';
                              if (group.id === 'temporary_volunteers') return item?.type === 'temp_vol';
                              return false;
                            }).length}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Individual Selection Panel */}
              {showIndividualSelection && (
                <div className="bg-bg/40 rounded-3xl border border-border p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative flex-grow w-full">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/30" />
                      <input
                        type="text"
                        placeholder={`Search ${showIndividualSelection.replace('_', ' ')}...`}
                        value={recipientSearchQuery}
                        onChange={(e) => setRecipientSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:border-primary outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const filtered = (showIndividualSelection === 'users' ? potentialRecipients.users : potentialRecipients.volunteers)
                            .filter(p => showIndividualSelection === 'users' ? true : p.type === showIndividualSelection.replace('s', ''))
                            .map(p => p.id);
                          
                          if (showIndividualSelection === 'users') {
                            setSelectedIndividualUsers(prev => [...new Set([...prev, ...filtered])]);
                          } else {
                            setSelectedIndividualVolunteers(prev => [...new Set([...prev, ...filtered])]);
                          }
                        }}
                        className="grow sm:flex-none px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          if (showIndividualSelection === 'users') {
                            setSelectedIndividualUsers([]);
                          } else {
                            const filteredOut = (showIndividualSelection === 'active_volunteers' ? 'active_vol' : 'temp_vol');
                            setSelectedIndividualVolunteers(prev => prev.filter(id => potentialRecipients.volunteers.find(v => v.id === id)?.type !== filteredOut));
                          }
                        }}
                        className="grow sm:flex-none px-4 py-2 bg-blood/10 text-blood rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-blood hover:text-white transition-all"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {isLoadingRecipients ? (
                      <div className="py-10 text-center">
                        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Loading Records...</p>
                      </div>
                    ) : (showIndividualSelection === 'users' ? potentialRecipients.users : potentialRecipients.volunteers)
                        .filter(p => {
                          if (showIndividualSelection === 'users') return true;
                          if (showIndividualSelection === 'active_volunteers') return p.type === 'active_vol';
                          if (showIndividualSelection === 'temporary_volunteers') return p.type === 'temp_vol';
                          return false;
                        })
                        .filter(p => 
                          p.name.toLowerCase().includes(recipientSearchQuery.toLowerCase()) || 
                          p.email.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
                          (p.displayId && p.displayId.toLowerCase().includes(recipientSearchQuery.toLowerCase()))
                        )
                        .map(p => {
                          const isSelected = (p.type === 'user' ? selectedIndividualUsers : selectedIndividualVolunteers).includes(p.id);
                          return (
                            <div 
                              key={p.id}
                              onClick={() => {
                                if (p.type === 'user') {
                                  setSelectedIndividualUsers(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]);
                                } else {
                                  setSelectedIndividualVolunteers(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]);
                                }
                              }}
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-primary/5 border-primary/30" 
                                  : "bg-white border-transparent hover:border-primary/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "bg-primary border-primary text-white" : "border-border bg-gray-50 text-transparent"
                                }`}>
                                  <FaCheck size={10} />
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm text-primary">{p.name}</p>
                                    {p.displayId && (
                                      <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
                                        {p.displayId}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-text-body/40 font-medium">{p.email}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    
                    {(showIndividualSelection === 'users' ? potentialRecipients.users : potentialRecipients.volunteers)
                        .filter(p => {
                          if (showIndividualSelection === 'users') return true;
                          if (showIndividualSelection === 'active_volunteers') return p.type === 'active_vol';
                          if (showIndividualSelection === 'temporary_volunteers') return p.type === 'temp_vol';
                          return false;
                        })
                        .filter(p => 
                          p.name.toLowerCase().includes(recipientSearchQuery.toLowerCase()) || 
                          p.email.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
                          (p.displayId && p.displayId.toLowerCase().includes(recipientSearchQuery.toLowerCase()))
                        ).length === 0 && !isLoadingRecipients && (
                      <div className="py-12 text-center text-text-body/30 italic text-sm">
                        No matches found for "{recipientSearchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSendingMail || !mailSubject || !mailBody}
              onClick={handleSendMassEmail}
              className="w-full bg-primary text-white font-black py-6 rounded-4xl transition-all shadow-2xl shadow-primary/30 active:scale-[0.98] uppercase tracking-[0.2em] text-xl disabled:opacity-40 flex items-center justify-center gap-4"
            >
              {isSendingMail ? "DISPATCHING..." : "DISPATCH EMAIL"}
            </button>
          </div>

          {showEmailPreview && (
            <div className="bg-bg/50 p-8 md:p-10 flex flex-col h-full animate-in slide-in-from-right-10 duration-500">
              <div className="sticky top-0 space-y-6">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Photorealistic Preview
                </label>

                <div className="email-client-wrapper bg-white rounded-3xl shadow-2xl border border-border/50 overflow-hidden transform scale-90 origin-top shadow-primary/5">
                  <div className="bg-[#F1F3F4] px-6 py-4 flex items-center gap-3 border-b border-border/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="bg-white px-4 py-1.5 rounded-lg text-xs text-text-body/40 grow truncate mx-2 font-medium">
                      {mailSubject || "New Message"}
                    </div>
                  </div>

                  <div className="p-0 overflow-y-auto max-h-[600px] bg-[#F4F6FB]">
                    <EmailPreviewContent
                      name="Volunteer Name"
                      heading={mailHeading || "Email Heading"}
                      body={
                        mailBody ||
                        "<p>Compose your message to see it render here...</p>"
                      }
                      bannerImage={mailBanner}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-border p-10">
        <h2 className="text-3xl font-black text-primary mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <FaHistory size={24} />
          </div>
          Email Broadcast History
        </h2>

        {isLoadingMailHistory ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-body/40 font-bold uppercase tracking-widest">
              Loading archives...
            </p>
          </div>
        ) : Array.isArray(mailHistory) && mailHistory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mailHistory.map((mail) => (
              <div
                key={mail._id}
                className="group bg-bg/30 border border-border rounded-3xl p-6 hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Sent to {mail.sentCount} recipients
                  </div>
                  <span className="text-[11px] font-bold text-text-body/30">
                    {new Date(mail.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <h3 className="font-black text-xl text-primary mb-2 group-hover:text-blood transition-colors">
                  {mail.subject}
                </h3>
                <p className="text-sm font-bold text-text-body/60 line-clamp-2 mb-6">
                  {mail.heading}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs capitalize">
                      {mail.admin?.name?.charAt(0) || "A"}
                    </div>
                    <span className="text-xs font-bold text-text-body/40">
                      By {mail.admin?.name || "Administrator"}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                    #{mail._id.slice(-6)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-bg/20 rounded-[2rem] border-2 border-dashed border-border/50">
            <FaHistory size={64} className="mx-auto text-primary/10 mb-6" />
            <h3 className="text-2xl font-black text-primary/20 uppercase tracking-tighter">
              No broadcasts found
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailManager;
