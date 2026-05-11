import React, { useEffect, useState, useMemo, useCallback } from "react";
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
} from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  const token = () => sessionStorage.getItem("adminToken");
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/emergency-fundraisers`, { headers: headers() });
      setRows(res.data || []);
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
                  <th className="px-4 py-3 text-right">Actions</th>
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
                        <div className="flex flex-wrap justify-end gap-1">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto overscroll-contain touch-pan-y">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[min(92dvh,920px)] overflow-y-auto overscroll-contain p-5 sm:p-8 md:p-10 my-4 sm:my-8 touch-pan-y"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex justify-between items-start gap-4 mb-6">
              <h3 className="text-2xl font-black text-primary">{editingId ? "Edit fundraiser" : "New fundraiser"}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-text-body/50 font-black hover:text-primary">
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div>
                <p className="text-[10px] font-black uppercase text-text-body/40">Live preview</p>
                <p className="text-lg font-black text-primary">₹{preview.pending.toLocaleString("en-IN")} pending</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-text-body/40">Progress</p>
                <p className="text-lg font-black">{preview.pct}% {preview.goalReached ? "· Goal reached" : ""}</p>
                <div className="h-2 rounded-full bg-black/10 mt-2">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${preview.pct}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-text-body/40">Title *</label>
                  <input className={input + " mt-1"} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-body/40">Slug (optional)</label>
                  <input className={input + " mt-1"} value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="auto from title" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-body/40">Patient name</label>
                  <input className={input + " mt-1"} value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-text-body/40">Short description</label>
                  <textarea className={input + " mt-1 min-h-[72px]"} value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-text-body/40">Full story</label>
                  <textarea className={input + " mt-1 min-h-[120px]"} value={form.fullDescription} onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-body/40">Hospital</label>
                  <input className={input + " mt-1"} value={form.hospitalName} onChange={(e) => setForm((p) => ({ ...p, hospitalName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-body/40">Medical condition</label>
                  <input className={input + " mt-1"} value={form.medicalCondition} onChange={(e) => setForm((p) => ({ ...p, medicalCondition: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-body/40">Target (₹) *</label>
                  <input type="number" min={1} className={input + " mt-1"} value={form.targetAmount} onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-body/40">Raised (₹)</label>
                  <input type="number" min={0} className={input + " mt-1"} value={form.raisedAmount} onChange={(e) => setForm((p) => ({ ...p, raisedAmount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-body/40">Supporters count</label>
                  <input type="number" min={0} className={input + " mt-1"} value={form.supportersCount} onChange={(e) => setForm((p) => ({ ...p, supportersCount: e.target.value }))} />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">Media</p>
                <div className="flex flex-wrap gap-3 mb-3">
                  <label className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-bg border border-border cursor-pointer text-xs font-black uppercase touch-manipulation">
                    <FaImage /> Add photo
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="hidden"
                      disabled={!!uploading}
                      onChange={(e) => onPickImage(e, "photo")}
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-bg border border-border cursor-pointer text-xs font-black uppercase touch-manipulation">
                    <FaVideo /> Upload video
                    <input
                      type="file"
                      accept="video/*,video/mp4,video/quicktime,.mp4,.mov,.webm,.mkv,.m4v"
                      className="hidden"
                      disabled={!!uploading}
                      onChange={onPickVideo}
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-bg border border-border cursor-pointer text-xs font-black uppercase touch-manipulation">
                    <FaQrcode /> QR image
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="hidden"
                      disabled={!!uploading}
                      onChange={(e) => onPickImage(e, "qrCodeImage")}
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-bg border border-border cursor-pointer text-xs font-black uppercase touch-manipulation">
                    Banner
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="hidden"
                      disabled={!!uploading}
                      onChange={(e) => onPickImage(e, "bannerImage")}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-text-body/45 font-medium mb-2 leading-relaxed">
                  Phone gallery &amp; camera supported. Photos up to 8MB. Long campaign videos (e.g. ~30 minutes) are allowed up to{" "}
                  {(MAX_VIDEO_BYTES / (1024 * 1024 * 1024)).toFixed(0)} GB — ensure your Cloudinary plan and server/proxy (e.g.{" "}
                  <code className="text-[9px] bg-bg px-1 rounded">client_max_body_size</code>) allow large uploads.
                </p>
                {uploading ? <p className="text-xs font-bold text-primary mb-2">Uploading {uploading}…</p> : null}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(form.photos || []).map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/50 text-white text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setForm((p) => ({ ...p, photos: p.photos.filter((_, j) => j !== i) }))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {form.videoUrl ? (
                  <p className="text-xs break-all text-text-body/60 mb-2">
                    Video: <a href={form.videoUrl} className="text-primary underline" target="_blank" rel="noreferrer">{form.videoUrl}</a>
                    <button type="button" className="ml-2 text-blood font-bold" onClick={() => setForm((p) => ({ ...p, videoUrl: "" }))}>
                      Clear
                    </button>
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  {form.qrCodeImage ? <img src={form.qrCodeImage} alt="QR" className="h-24 object-contain border rounded-xl p-1" /> : null}
                  {form.bannerImage ? <img src={form.bannerImage} alt="Banner" className="h-24 object-cover border rounded-xl" /> : null}
                </div>
                <p className="text-[10px] text-text-body/40 mt-2">Or paste video URL (YouTube / file URL)</p>
                <input className={input + " mt-1"} value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="https://..." />
              </div>

              <div className="border-t border-border pt-6 grid md:grid-cols-2 gap-4">
                <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-primary">Bank</p>
                {["accountHolderName", "bankName", "accountNumber", "ifscCode", "upiId"].map((k) => (
                  <div key={k}>
                    <label className="text-[10px] font-black uppercase text-text-body/40">{k}</label>
                    <input
                      className={input + " mt-1"}
                      value={form.bankDetails[k] || ""}
                      onChange={(e) => setForm((p) => ({ ...p, bankDetails: { ...p.bankDetails, [k]: e.target.value } }))}
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 grid md:grid-cols-2 gap-4">
                <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-primary">Contact</p>
                {["phone", "alternatePhone", "email"].map((k) => (
                  <div key={k} className={k === "email" ? "md:col-span-2" : ""}>
                    <label className="text-[10px] font-black uppercase text-text-body/40">{k}</label>
                    <input
                      className={input + " mt-1"}
                      value={form.contactDetails[k] || ""}
                      onChange={(e) => setForm((p) => ({ ...p, contactDetails: { ...p.contactDetails, [k]: e.target.value } }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 border-t border-border pt-6">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} /> Active
                </label>
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} /> Featured on home
                </label>
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input type="checkbox" checked={form.showPopup} onChange={(e) => setForm((p) => ({ ...p, showPopup: e.target.checked }))} /> Homepage popup
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-border">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl border-2 border-border font-black text-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyFundraisersManager;
