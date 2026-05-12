import React, { useState, useEffect } from "react";
import { FaCommentDots, FaTrash, FaCheck, FaEye, FaClock, FaCheckCircle, FaSearch, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: <FaClock className="text-[10px]" /> },
  reviewed: { label: "Reviewed", color: "bg-blue-100 text-blue-700", icon: <FaEye className="text-[10px]" /> },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700", icon: <FaCheckCircle className="text-[10px]" /> },
};

/* ── Confirmation Dialog ─────────────────────────────── */
const ConfirmDialog = ({ isOpen, onClose, onConfirm, feedbackName }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[301] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Delete Feedback?
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
                Are you sure you want to delete the feedback from{" "}
                <strong className="text-slate-600">{feedbackName}</strong>? This
                action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <FaTrash className="text-xs" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (error) {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.patch(
        `${API_URL}/feedback/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status } : f))
      );
      toast.success(`Feedback marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(`${API_URL}/feedback/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks((prev) => prev.filter((f) => f._id !== deleteTarget._id));
      toast.success("Feedback deleted");
    } catch {
      toast.error("Failed to delete feedback");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = feedbacks.filter((f) => {
    const matchesFilter = f.status === filter;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === "pending").length,
    reviewed: feedbacks.filter((f) => f.status === "reviewed").length,
    resolved: feedbacks.filter((f) => f.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
              <FaCommentDots size={16} />
            </span>
            User Feedback
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {counts.all} total • {counts.pending} pending
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["pending", "reviewed", "resolved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              filter === tab
                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Feedback Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FaCommentDots className="text-5xl text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold text-lg">No feedback found</p>
          <p className="text-slate-300 text-sm mt-1">
            {filter !== "all"
              ? "Try changing the filter"
              : "Feedback from users will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filtered.map((fb) => {
              const statusCfg = STATUS_CONFIG[fb.status];
              return (
                <motion.div
                  key={fb._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                        {fb.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-black text-slate-800 text-sm tracking-tight">
                            {fb.name}
                          </h3>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${statusCfg.color}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </div>
                          <span className="text-[11px] text-slate-300 font-medium">
                            {new Date(fb.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                          {fb.message}
                        </p>
                        {Array.isArray(fb.attachmentUrls) && fb.attachmentUrls.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {fb.attachmentUrls.map((url, i) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-slate-100 text-primary border border-slate-200 hover:bg-slate-200"
                              >
                                Attachment {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {fb.status !== "reviewed" && (
                          <button
                            onClick={() => updateStatus(fb._id, "reviewed")}
                            title="Mark as reviewed"
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"
                          >
                            <FaEye className="text-xs" />
                          </button>
                        )}
                        {fb.status !== "resolved" && (
                          <button
                            onClick={() => updateStatus(fb._id, "resolved")}
                            title="Mark as resolved"
                            className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-500 flex items-center justify-center transition-colors"
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(fb)}
                          title="Delete feedback"
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        feedbackName={deleteTarget?.name || ""}
      />
    </div>
  );
};

export default FeedbackManager;
