import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaMoneyCheckAlt, FaSearch, FaCheck, FaTimes, FaWallet, FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const ReimbursementsManager = () => {
  const { onStatusUpdate } = useOutletContext();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("pending");
  const [commentDraft, setCommentDraft] = useState({});
  const [payConfirm, setPayConfirm] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reimbursements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data || []);
      if (onStatusUpdate) onStatusUpdate();
    } catch (_err) {
      toast.error("Failed to fetch reimbursement requests");
    } finally {
      setIsLoading(false);
    }
  }, [onStatusUpdate]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    let result = items;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((i) => i.status === filter);
    }

    // Apply text search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter((i) => JSON.stringify(i).toLowerCase().includes(q));
    }

    return result;
  }, [items, searchQuery, filter]);

  const totals = useMemo(() => {
    const totalPaid = items
      .filter((row) => row.status === "paid")
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const totalApproved = items
      .filter((row) => row.status === "approved")
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const totalPending = items
      .filter((row) => row.status === "pending")
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const totalRejected = items
      .filter((row) => row.status === "rejected")
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    return { totalPaid, totalApproved, totalPending, totalRejected };
  }, [items]);

  const counts = useMemo(() => ({
    all: items.length,
    pending: items.filter(i => i.status === "pending").length,
    approved: items.filter(i => i.status === "approved").length,
    paid: items.filter(i => i.status === "paid").length,
    rejected: items.filter(i => i.status === "rejected").length,
  }), [items]);

  const updateStatus = useCallback(async (id, status) => {
    setIsUpdating(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const adminComment = commentDraft[id] || "";
      await axios.put(
        `${import.meta.env.VITE_API_URL}/reimbursements/${id}/status`,
        { status, adminComment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Marked as ${status}`);
      setPayConfirm(null);
      fetchItems();
    } catch (_err) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  }, [commentDraft, fetchItems]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <FaMoneyCheckAlt /> Reimbursements
          </h2>

          <div className="relative w-full md:w-[420px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/40" />
            <input
              type="text"
              placeholder="Search reimbursements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-indigo-200 p-4 bg-indigo-50">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-700/70">Total Paid</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">₹{totals.totalPaid.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-xl border border-green-200 p-4 bg-green-50">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-700/70">Total Approved</p>
            <p className="text-2xl font-black text-green-700 mt-1">₹{totals.totalApproved.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-xl border border-amber-200 p-4 bg-amber-50">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700/70">Pending Amount</p>
            <p className="text-2xl font-black text-amber-700 mt-1">₹{totals.totalPending.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-xl border border-red-200 p-4 bg-red-50">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-700/70">Total Rejected</p>
            <p className="text-2xl font-black text-red-700 mt-1">₹{totals.totalRejected.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["pending", "approved", "paid", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === tab
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
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
            <p className="text-text-body/60 font-medium italic">Loading requests...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-body/40 text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-4 py-4">Volunteer</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Purpose</th>
                  <th className="px-4 py-4">Receipt</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Admin Comment</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filtered.map((i) => (
                  <tr key={i._id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold">{i.volunteer?.fullName || i.user?.name}</div>
                      <div className="text-[11px] text-text-body/50">{i.user?.email}</div>
                      {i.volunteer?.volunteerId && (
                        <div className="text-[10px] mt-1 inline-block bg-primary text-white px-2 py-0.5 rounded-full font-black tracking-widest">
                          {i.volunteer.volunteerId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-black text-primary">₹{i.amount}</td>
                    <td className="px-4 py-4">{i.purpose}</td>
                    <td className="px-4 py-4">
                      {i.receiptImageUrl ? (
                        <button 
                          onClick={() => setSelectedProof(i.receiptImageUrl)}
                          className="px-4 py-2 rounded-lg border border-border bg-bg/30 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-[11px] text-text-body/30 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold uppercase text-[11px]">
                      <span className={`px-2.5 py-1 rounded-full ${
                        i.status === "paid" ? "bg-indigo-100 text-indigo-700" :
                        i.status === "approved" ? "bg-green-100 text-green-700" :
                        i.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-[260px]">
                      <textarea
                        rows={2}
                        value={commentDraft[i._id] ?? i.adminComment ?? ""}
                        onChange={(e) => setCommentDraft((p) => ({ ...p, [i._id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-xl text-[12px] outline-none focus:border-primary"
                        placeholder="Optional comment / query"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        {i.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(i._id, "approved")}
                              className="px-3 py-2 rounded-lg bg-green-600 text-white font-black text-[11px] flex items-center gap-2 transition-all hover:bg-green-700"
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => updateStatus(i._id, "rejected")}
                              className="px-3 py-2 rounded-lg bg-blood text-white font-black text-[11px] flex items-center gap-2 transition-all hover:bg-red-700"
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}
                        {i.status === "approved" && (
                          <>
                            <button
                              onClick={() => setPayConfirm(i)}
                              className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-black text-[11px] flex items-center gap-2 transition-all hover:bg-indigo-700"
                            >
                              <FaWallet /> Mark as Paid
                            </button>
                            <button
                              onClick={() => updateStatus(i._id, "rejected")}
                              className="px-3 py-2 rounded-lg bg-blood text-white font-black text-[11px] flex items-center gap-2 transition-all hover:bg-red-700"
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}
                        {i.status === "rejected" && (
                          <button
                            onClick={() => updateStatus(i._id, "approved")}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white font-black text-[11px] flex items-center gap-2 transition-all hover:bg-green-700"
                          >
                            <FaCheck /> Approve
                          </button>
                        )}
                        {i.status === "paid" && (
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            Payment Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-text-body/60 font-bold">No reimbursement requests</div>
        )}
      </div>

      {/* Mark as Paid Confirmation */}
      <AnimatePresence>
        {payConfirm && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaWallet size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Confirm Payment?</h3>
              <p className="text-text-body/60 font-medium mb-8 leading-relaxed">
                You are marking the reimbursement for <strong className="text-gray-900">₹{payConfirm.amount}</strong> as successfully paid. This action <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">cannot be undone</span>.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPayConfirm(null)}
                  disabled={isUpdating}
                  className="py-4 rounded-2xl bg-bg text-text-body font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(payConfirm._id, "paid")}
                  disabled={isUpdating}
                  className="py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Confirming...</> : "Mark as Paid"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Preview Modal */}
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
                alt="Receipt Full Size" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReimbursementsManager;

