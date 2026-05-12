import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaHeart, FaSearch, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DonationsManager = () => {
  const { onStatusUpdate } = useOutletContext();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("pending");
  const [commentDraft, setCommentDraft] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedProof, setSelectedProof] = useState(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data || []);
      if (onStatusUpdate) onStatusUpdate();
    } catch (_err) {
      toast.error("Failed to fetch donations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let result = items;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((i) => i.status === filter);
    }

    // Apply text search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter((i) => 
        i.name?.toLowerCase().includes(q) || 
        i.email?.toLowerCase().includes(q) || 
        i.transactionId?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, searchQuery, filter]);

  const counts = useMemo(() => ({
    pending: items.filter(i => i.status === "pending").length,
    approved: items.filter(i => i.status === "approved").length,
    rejected: items.filter(i => i.status === "rejected").length,
  }), [items]);

  const updateStatus = async (id, status) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const adminComment = commentDraft[id] || "";
      await axios.put(
        `${import.meta.env.VITE_API_URL}/donations/${id}/status`,
        { status, adminComment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Donation ${status}`);
      fetchItems();
    } catch (_err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(`${import.meta.env.VITE_API_URL}/donations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Donation record deleted");
      setDeleteConfirm(null);
      fetchItems();
    } catch (_err) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-black text-primary flex items-center gap-3">
            <FaHeart className="text-blood" /> Donations
          </h2>

          <div className="relative w-full md:w-[420px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/40" />
            <input
              type="text"
              placeholder="Search donor, email or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 border border-border rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full text-sm font-medium bg-bg/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                filter === tab
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-white text-text-body/40 hover:bg-slate-50 border-slate-100"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-body/60 font-bold italic tracking-tight">Fetching donations...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg/50 border-b border-border text-text-body/40 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-6 py-5">Donor Details</th>
                  <th className="px-6 py-5 text-center">Amount</th>
                  <th className="px-6 py-5">Transaction Info</th>
                  <th className="px-6 py-5">Proof</th>
                  <th className="px-6 py-5">Admin Comment</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filtered.map((i) => (
                  <tr key={i._id} className="hover:bg-bg/30 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="font-black text-gray-800 text-base">{i.name}</div>
                      <div className="text-[12px] text-text-body/50 font-bold">{i.email}</div>
                      <div className="text-[12px] text-text-body/50 font-medium">{i.phone}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-block px-4 py-1 rounded-full bg-green-50 text-green-700 font-black text-lg">
                        ₹{i.amount.toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Transaction ID</div>
                      <div className="font-mono text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 select-all">{i.transactionId}</div>
                      <div className="text-[10px] mt-2 text-text-body/40 italic">{i.locationAddress}</div>
                    </td>
                    <td className="px-6 py-6">
                      {i.donationImageUrl ? (
                        <button 
                          onClick={() => setSelectedProof(i.donationImageUrl)}
                          className="flex items-center justify-center w-12 h-12 rounded-xl border border-border overflow-hidden hover:border-primary transition-all shadow-sm group/proof relative"
                        >
                          <img src={i.donationImageUrl} className="w-full h-full object-cover" alt="Proof" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/proof:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                              <FaSearch size={10} className="text-primary" />
                            </div>
                          </div>
                        </button>
                      ) : (
                        <span className="text-[11px] text-text-body/30 italic">No proof</span>
                      )}
                    </td>
                    <td className="px-6 py-6 min-w-[200px]">
                      <textarea
                        rows={2}
                        value={commentDraft[i._id] ?? i.adminComment ?? ""}
                        onChange={(e) => setCommentDraft((p) => ({ ...p, [i._id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-xl text-[12px] font-medium outline-none focus:border-primary transition-all bg-bg/20 focus:bg-white"
                        placeholder="Internal note..."
                      />
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        {i.status !== "approved" && (
                          <button
                            onClick={() => updateStatus(i._id, "approved")}
                            className="px-4 py-2 rounded-xl bg-green-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                          >
                            <FaCheck /> Approve
                          </button>
                        )}
                        {i.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(i._id, "rejected")}
                            className="px-4 py-2 rounded-xl bg-blood text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all"
                          >
                            <FaTimes /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(i._id)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all self-center mt-1"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center text-text-body/20">
              <FaHeart size={32} />
            </div>
            <div>
              <p className="text-xl font-black text-text-body/30 uppercase tracking-tighter">No donations found</p>
              <p className="text-sm text-text-body/20 font-bold">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Proof Preview Modal */}
      <AnimatePresence>
        {selectedProof && (
          <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProof(null)}
                className="absolute -top-12 right-0 md:-right-12 p-3 text-white hover:text-blood transition-colors bg-white/10 rounded-full backdrop-blur-md border border-white/20"
              >
                <FaTimes size={24} />
              </button>
              <img 
                src={selectedProof} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" 
                alt="Proof Full Size" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTrash size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Record?</h3>
              <p className="text-text-body/60 font-medium mb-8">
                This will permanently remove this donation record. This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="py-4 rounded-2xl bg-bg text-text-body font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="py-4 rounded-2xl bg-blood text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blood/20 hover:bg-red-700 transition-all"
                >
                  Delete Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    );
  };

export default DonationsManager;
