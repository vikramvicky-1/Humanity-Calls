import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCommentDots, FaPaperPlane, FaThumbtack, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../utils/apiConfig.js";

const FeedbackModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [attachmentUrls, setAttachmentUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (attachmentUrls.length >= 8) {
      toast.error("Maximum 8 attachments.");
      return;
    }
    setUploading(true);
    try {
      const next = [...attachmentUrls];
      for (const file of files) {
        if (next.length >= 8) break;
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 8MB).`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await axios.post(`${API_URL}/feedback/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.url) next.push(res.data.url);
      }
      setAttachmentUrls(next);
      if (next.length > attachmentUrls.length) toast.success("Files attached");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/feedback`, {
        ...formData,
        attachmentUrls,
      });
      toast.success("Thank you for your feedback! 🙏");
      setFormData({ name: "", message: "" });
      setAttachmentUrls([]);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            onClick={(ev) => ev.target === ev.currentTarget && onClose()}
          >
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#2d2d3d] px-8 pt-8 pb-6 shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <FaTimes className="text-xs" />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center mb-4">
                  <FaCommentDots className="text-yellow-400 text-lg" />
                </div>
                <h2
                  className="text-2xl font-black text-white tracking-tight"
                  style={{ fontFamily: '"Syne", sans-serif' }}
                >
                  Share Your Feedback
                </h2>
                <p
                  className="text-white/40 text-sm font-medium mt-2 leading-relaxed"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Having any issues or suggestions? Attach screenshots (pin icon) to help us reproduce UI problems.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
                <div>
                  <label
                    className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 ml-1"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Your Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full bg-black/[0.02] border border-black/5 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-black/20 focus:ring-2 focus:ring-blood/10 focus:border-blood/20 transition-all outline-none"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </div>

                <div>
                  <label
                    className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 ml-1"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    className="w-full bg-black/[0.02] border border-black/5 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-black/20 focus:ring-2 focus:ring-blood/10 focus:border-blood/20 transition-all outline-none resize-none"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 ml-1">
                    <FaThumbtack className="text-primary" /> Error screenshots (optional, up to 8)
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-black/10 hover:border-primary/40 cursor-pointer text-xs font-black text-primary/80">
                    {uploading ? "Uploading…" : "Add images or PDFs"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,application/pdf"
                      multiple
                      onChange={handleFiles}
                      disabled={uploading || attachmentUrls.length >= 8}
                    />
                  </label>
                  {attachmentUrls.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {attachmentUrls.map((url, i) => (
                        <li key={url} className="flex items-center justify-between gap-2 text-[11px] font-bold bg-black/[0.03] rounded-lg px-2 py-1.5">
                          <a href={url} target="_blank" rel="noreferrer" className="text-primary truncate min-w-0">
                            File {i + 1}
                          </a>
                          <button
                            type="button"
                            className="p-1 text-blood hover:bg-blood/10 rounded"
                            onClick={() => setAttachmentUrls((prev) => prev.filter((_, j) => j !== i))}
                            aria-label="Remove attachment"
                          >
                            <FaTrash className="text-[10px]" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative bg-[#1a1a1a] text-white py-4 rounded-2xl shadow-xl shadow-black/5 overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    className="absolute inset-0 bg-blood z-0 origin-center"
                  />
                  <div className="relative z-10 flex items-center justify-center gap-2.5">
                    <span
                      className="text-[11px] font-black uppercase tracking-widest"
                      style={{ fontFamily: '"Syne", sans-serif' }}
                    >
                      {loading ? "Submitting..." : "Submit Feedback"}
                    </span>
                    {!loading && <FaPaperPlane className="text-xs" />}
                  </div>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
