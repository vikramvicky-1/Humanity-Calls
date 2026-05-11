import React, { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaWindowMaximize,
  FaWindowMinimize,
  FaCopy,
  FaDownload,
  FaImage,
  FaVideo,
  FaQrcode,
  FaSearch,
  FaTimes,
  FaUserFriends,
} from "react-icons/fa";
import { useOutletContext, useNavigate } from "react-router-dom";
import { downloadEmergencyBannerPng } from "../../utils/downloadEmergencyBanner";

/** Mobile Safari often omits MIME type; iOS uses HEIC / video/quicktime. */
const extOf = (f) => {
  const n = (f?.name || "").toLowerCase();
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i + 1) : "";
};

const looksLikeImageFile = (file) => {
  const t = (file?.type || "").toLowerCase();
  if (t.startsWith("image/")) return true;
  return ["jpg", "jpeg", "png", "webp", "heic", "heif", "avif"].includes(extOf(file));
};

const looksLikeVideoFile = (file) => {
  const t = (file?.type || "").toLowerCase();
  if (t.startsWith("video/")) return true;
  return ["mp4", "mov", "webm", "mkv", "m4v", "3gp", "mpeg"].includes(extOf(file));
};

/** Must stay in sync with backend default (see EMERGENCY_VIDEO_MAX_BYTES). */
const MAX_VIDEO_BYTES =
  Number(import.meta.env.VITE_EMERGENCY_VIDEO_MAX_BYTES) > 0
    ? Number(import.meta.env.VITE_EMERGENCY_VIDEO_MAX_BYTES)
    : 5 * 1024 * 1024 * 1024;

const emptyForm = () => ({
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  patientName: "",
  hospitalName: "",
  medicalCondition: "",
  targetAmount: "",
  raisedAmount: "0",
  supportersCount: "0",
  photos: [],
  videoUrl: "",
  qrCodeImage: "",
  bannerImage: "",
  bankDetails: {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  },
  contactDetails: {
    phone: "",
    alternatePhone: "",
    email: "",
  },
  isActive: true,
  isFeatured: false,
  showPopup: false,
});

const EmergencyFundraisersManager = () => {
  const { onStatusUpdate } = useOutletContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [pendingCounts, setPendingCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  // Body scroll lock
  useEffect(() => {
    if (modalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      if (window.__lenis) window.__lenis.start();
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      if (window.__lenis) window.__lenis.start();
    };
  }, [modalOpen]);

  const token = () => sessionStorage.getItem("adminToken");
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/emergency-fundraisers`, { headers: headers() }),
        axios.get(`${import.meta.env.VITE_API_URL}/emergency-donations/pending-counts-grouped`, { headers: headers() }),
      ]);
      setRows(fRes.data || []);
      const counts = {};
      (pRes.data || []).forEach(c => { counts[c._id] = c.count; });
      setPendingCounts(counts);
    } catch {
      toast.error("Failed to load fundraisers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const preview = useMemo(() => {
    const target = Math.max(0, Number(form.targetAmount) || 0);
    const raised = Math.max(0, Number(form.raisedAmount) || 0);
    const pending = Math.max(0, target - raised);
    const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 1000) / 10) : 0;
    return { target, raised, pending, pct, goalReached: target > 0 && raised >= target };
  }, [form.targetAmount, form.raisedAmount]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.slug?.toLowerCase().includes(q) ||
        r.patientName?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      title: row.title || "",
      slug: row.slug || "",
      shortDescription: row.shortDescription || "",
      fullDescription: row.fullDescription || "",
      patientName: row.patientName || "",
      hospitalName: row.hospitalName || "",
      medicalCondition: row.medicalCondition || "",
      targetAmount: String(row.targetAmount ?? ""),
      raisedAmount: String(row.raisedAmount ?? "0"),
      supportersCount: String(row.supportersCount ?? "0"),
      photos: row.photos || [],
      videoUrl: row.videoUrl || "",
      qrCodeImage: row.qrCodeImage || "",
      bannerImage: row.bannerImage || "",
      bankDetails: { ...emptyForm().bankDetails, ...(row.bankDetails || {}) },
      contactDetails: { ...emptyForm().contactDetails, ...(row.contactDetails || {}) },
      isActive: !!row.isActive,
      isFeatured: !!row.isFeatured,
      showPopup: !!row.showPopup,
    });
    setModalOpen(true);
  };

  const uploadFile = async (file, kind) => {
    const fd = new FormData();
    fd.append("file", file);
    const path = kind === "video" ? "/upload/video" : "/upload/image";
    // Do not set Content-Type manually — browser must add multipart boundary (critical on mobile).
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/emergency-fundraisers${path}`, fd, {
      headers: { ...headers() },
      withCredentials: true,
    });
    return res.data.url || res.data.imageUrl || res.data.videoUrl;
  };

  const onPickImage = async (e, field) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!looksLikeImageFile(file)) {
      toast.error("Please choose a photo (JPEG, PNG, WebP, or HEIC from your gallery)");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setUploading(field);
    try {
      const url = await uploadFile(file, "image");
      if (field === "photo") {
        setForm((p) => ({ ...p, photos: [...(p.photos || []), url] }));
      } else {
        setForm((p) => ({ ...p, [field]: url }));
      }
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const onPickVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!looksLikeVideoFile(file)) {
      toast.error("Please choose a video from your gallery or camera roll");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(`Video is too large (max ${(MAX_VIDEO_BYTES / (1024 * 1024 * 1024)).toFixed(1)} GB). Ask your host to raise limits if needed.`);
      return;
    }
    setUploading("video");
    try {
      const url = await uploadFile(file, "video");
      setForm((p) => ({ ...p, videoUrl: url }));
      toast.success("Video uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Video upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    const target = Number(form.targetAmount);
    if (!target || target < 1) {
      toast.error("Valid target amount required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug?.trim() || undefined,
      shortDescription: form.shortDescription,
      fullDescription: form.fullDescription,
      patientName: form.patientName,
      hospitalName: form.hospitalName,
      medicalCondition: form.medicalCondition,
      targetAmount: target,
      raisedAmount: Number(form.raisedAmount) || 0,
      supportersCount: Number(form.supportersCount) || 0,
      photos: form.photos,
      videoUrl: form.videoUrl,
      qrCodeImage: form.qrCodeImage,
      bannerImage: form.bannerImage,
      bankDetails: form.bankDetails,
      contactDetails: form.contactDetails,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      showPopup: form.showPopup,
    };
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/emergency-fundraisers/${editingId}`, payload, { headers: headers() });
        toast.success("Updated");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/emergency-fundraisers`, payload, { headers: headers() });
        toast.success("Created");
      }
      setModalOpen(false);
      fetchRows();
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this fundraiser permanently?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/emergency-fundraisers/${id}`, { headers: headers() });
      toast.success("Deleted");
      fetchRows();
    } catch {
      toast.error("Delete failed");
    }
  };

  const patchToggle = async (id, path) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/emergency-fundraisers/${id}/${path}`, {}, { headers: headers() });
      toast.success("Updated");
      fetchRows();
    } catch {
      toast.error("Toggle failed");
    }
  };

  const copyLink = (row) => {
    const url = row.shareLink || `${window.location.origin}/emergency-funding/${row.slug}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied"),
      () => toast.error("Copy failed"),
    );
  };

  const adminBanner = async (row) => {
    try {
      await downloadEmergencyBannerPng({
        patientImageUrl: row.photos?.[0] || row.bannerImage,
        title: row.title,
        patientName: row.patientName,
        targetAmount: row.targetAmount,
        raisedAmount: row.raisedAmount,
        pendingAmount: row.pendingAmount,
        qrImageUrl: row.qrCodeImage,
        filename: `HC-banner-${row.slug}.png`,
      });
      toast.success("Banner downloaded");
    } catch {
      toast.error("Banner export failed");
    }
  };

  const input =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-primary flex items-center gap-3">
              <FaHeart className="text-blood" /> Emergency funding
            </h2>
            <p className="mt-2 text-sm text-text-body/60 max-w-2xl font-medium leading-relaxed">
              All campaigns, media, bank details, and amounts are configured here only. The public site only displays active fundraisers — there is no public submission form.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-lg"
          >
            <FaPlus /> New fundraiser
          </button>
        </div>

        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/40" />
          <input
            className={input + " pl-11"}
            placeholder="Search title, slug, patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-text-body/50 font-bold">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl text-text-body/60 font-bold">
            No fundraisers yet. Create one to show on the website.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-bg text-[10px] font-black uppercase tracking-widest text-text-body/50">
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3 text-center">Flags</th>
                  <th className="px-4 py-3 text-right min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const pct = r.progressPercentage ?? 0;
                  const pend = r.pendingAmount ?? 0;
                  return (
                    <tr key={r._id} className="hover:bg-bg/40">
                      <td className="px-4 py-4">
                        <div className="font-black text-text-body">{r.title}</div>
                        <div className="text-[11px] text-text-body/45 font-mono mt-0.5">{r.slug}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs font-bold">
                          ₹{(r.raisedAmount || 0).toLocaleString("en-IN")} / ₹{(r.targetAmount || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-blood font-bold mt-1">Pending ₹{pend.toLocaleString("en-IN")}</div>
                        <div className="mt-2 h-1.5 rounded-full bg-black/5 w-36">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <div className="text-[10px] text-text-body/40 mt-1">{pct}%</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => patchToggle(r._id, "toggle-active")}
                            className={`p-2 rounded-lg text-xs font-black ${r.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                            title="Active"
                          >
                            {r.isActive ? <FaEye /> : <FaEyeSlash />}
                          </button>
                          <button
                            type="button"
                            onClick={() => patchToggle(r._id, "toggle-featured")}
                            className={`p-2 rounded-lg ${r.isFeatured ? "text-amber-500" : "text-slate-300"}`}
                            title="Featured"
                          >
                            {r.isFeatured ? <FaStar /> : <FaRegStar />}
                          </button>
                          <button
                            type="button"
                            onClick={() => patchToggle(r._id, "toggle-popup")}
                            className={`p-2 rounded-lg ${r.showPopup ? "text-primary" : "text-slate-300"}`}
                            title="Home popup"
                          >
                            {r.showPopup ? <FaWindowMaximize /> : <FaWindowMinimize />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col gap-2">
                          <button 
                            type="button" 
                            onClick={() => navigate(`/admin/emergency-donors?fundraiserId=${r._id}`)} 
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all relative group shadow-sm border border-indigo-100" 
                            title="Manage Donors"
                          >
                            <FaUserFriends className="group-hover:scale-110 transition-transform" /> 
                            <span>Manage Donors</span>
                            {pendingCounts[r._id] > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-white animate-bounce">
                                {pendingCounts[r._id]}
                              </span>
                            )}
                          </button>
                          
                          <div className="flex justify-end gap-1">
                            <button type="button" onClick={() => openEdit(r)} className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Edit">
                              <FaEdit />
                            </button>
                            <button type="button" onClick={() => copyLink(r)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Copy link">
                              <FaCopy />
                            </button>
                            <button type="button" onClick={() => adminBanner(r)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Banner">
                              <FaDownload />
                            </button>
                            <button type="button" onClick={() => remove(r._id)} className="p-2 text-blood hover:bg-blood/10 rounded-lg" title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="p-8 border-b border-primary/5 flex items-center justify-between bg-primary/5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <FaHeart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary">{editingId ? "Edit Fundraiser" : "New Fundraiser"}</h3>
                  <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Update campaign information</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-3 bg-white hover:bg-bg rounded-2xl shadow-sm transition-all text-primary/40 hover:text-primary"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div 
              className="p-10 overflow-y-auto flex-grow min-h-0 custom-scrollbar bg-white"
              style={{ overscrollBehavior: 'contain' }}
              data-lenis-prevent
            >
              <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                <div>
                  <p className="text-[10px] font-black uppercase text-text-body/40 tracking-widest">Live preview</p>
                  <p className="text-xl font-black text-primary mt-1">₹{preview.pending.toLocaleString("en-IN")} pending</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-body/40 tracking-widest">Goal Progress</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-black">{preview.pct}%</p>
                    {preview.goalReached && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">GOAL REACHED</span>}
                  </div>
                  <div className="h-2 rounded-full bg-black/10 mt-2 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${preview.pct}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Title *</label>
                    <input className={input} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Slug (optional)</label>
                    <input className={input} value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="auto from title" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Patient name</label>
                    <input className={input} value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Short description</label>
                    <textarea className={input + " min-h-[72px] resize-none"} value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Full story</label>
                    <textarea className={input + " min-h-[160px] resize-none"} value={form.fullDescription} onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Hospital</label>
                    <input className={input} value={form.hospitalName} onChange={(e) => setForm((p) => ({ ...p, hospitalName: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Medical condition</label>
                    <input className={input} value={form.medicalCondition} onChange={(e) => setForm((p) => ({ ...p, medicalCondition: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Target (₹) *</label>
                    <input type="number" min={1} className={input} value={form.targetAmount} onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Raised (₹)</label>
                    <input type="number" min={0} className={input} value={form.raisedAmount} onChange={(e) => setForm((p) => ({ ...p, raisedAmount: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Supporters count</label>
                    <input type="number" min={0} className={input} value={form.supportersCount} onChange={(e) => setForm((p) => ({ ...p, supportersCount: e.target.value }))} />
                  </div>
                </div>

                <div className="p-8 bg-bg/50 rounded-[2.5rem] border border-primary/5 space-y-6">
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Campaign Media</h4>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-primary/10 cursor-pointer text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                      <FaImage /> Add photo
                      <input type="file" accept="image/*,.heic,.heif" className="hidden" disabled={!!uploading} onChange={(e) => onPickImage(e, "photo")} />
                    </label>
                    <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-primary/10 cursor-pointer text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                      <FaVideo /> Upload video
                      <input type="file" accept="video/*" className="hidden" disabled={!!uploading} onChange={onPickVideo} />
                    </label>
                    <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-primary/10 cursor-pointer text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                      <FaQrcode /> QR image
                      <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={(e) => onPickImage(e, "qrCodeImage")} />
                    </label>
                    <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-primary/10 cursor-pointer text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                      Banner
                      <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={(e) => onPickImage(e, "bannerImage")} />
                    </label>
                  </div>
                  
                  {uploading && <p className="text-xs font-black text-primary animate-pulse italic">Uploading {uploading}...</p>}
                  
                  <div className="flex flex-wrap gap-3">
                    {(form.photos || []).map((url, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute inset-0 bg-blood/60 text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          onClick={() => setForm((p) => ({ ...p, photos: p.photos.filter((_, j) => j !== i) }))}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {form.qrCodeImage && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-1">Current QR</label>
                        <img src={form.qrCodeImage} alt="QR" className="w-full h-32 object-contain bg-white rounded-2xl border border-primary/5 p-2" />
                      </div>
                    )}
                    {form.bannerImage && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-1">Current Banner</label>
                        <img src={form.bannerImage} alt="Banner" className="w-full h-32 object-cover rounded-2xl border border-primary/5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Video URL (YouTube/File)</label>
                    <input className={input} value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="p-8 bg-bg/50 rounded-[2.5rem] border border-primary/5 space-y-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Bank Details</h4>
                    {["accountHolderName", "bankName", "accountNumber", "ifscCode", "upiId"].map((k) => (
                      <div key={k} className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-1">{k.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <input
                          className={input}
                          value={form.bankDetails[k] || ""}
                          onChange={(e) => setForm((p) => ({ ...p, bankDetails: { ...p.bankDetails, [k]: e.target.value } }))}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-bg/50 rounded-[2.5rem] border border-primary/5 space-y-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Contact Information</h4>
                    {["phone", "alternatePhone", "email"].map((k) => (
                      <div key={k} className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-1">{k.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <input
                          className={input}
                          value={form.contactDetails[k] || ""}
                          onChange={(e) => setForm((p) => ({ ...p, contactDetails: { ...p.contactDetails, [k]: e.target.value } }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-bg/50 rounded-[2.5rem] border border-primary/5 flex flex-wrap gap-8 justify-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="w-5 h-5 rounded-lg border-primary/20 text-primary focus:ring-primary/20" />
                    <span className="text-sm font-black text-text-body/60 group-hover:text-primary transition-colors uppercase tracking-widest">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="w-5 h-5 rounded-lg border-primary/20 text-primary focus:ring-primary/20" />
                    <span className="text-sm font-black text-text-body/60 group-hover:text-primary transition-colors uppercase tracking-widest">Featured</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.showPopup} onChange={(e) => setForm((p) => ({ ...p, showPopup: e.target.checked }))} className="w-5 h-5 rounded-lg border-primary/20 text-primary focus:ring-primary/20" />
                    <span className="text-sm font-black text-text-body/60 group-hover:text-primary transition-colors uppercase tracking-widest">Popup</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-8 bg-primary/5 border-t border-primary/5 flex items-center justify-end gap-4 shrink-0">
              <button 
                onClick={() => setModalOpen(false)} 
                className="px-8 py-4 text-primary/40 hover:text-primary font-black text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={save}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save All Changes"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
  </div>
);
};

export default EmergencyFundraisersManager;
