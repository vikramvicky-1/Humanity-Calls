import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaMoneyCheckAlt, FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

const ReimbursementsManager = () => {
  const { onStatusUpdate } = useOutletContext();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [commentDraft, setCommentDraft] = useState({});

  const fetchItems = async () => {
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
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter((i) => JSON.stringify(i).toLowerCase().includes(q));
  }, [items, searchQuery]);

  const updateStatus = async (id, status) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const adminComment = commentDraft[id] || "";
      await axios.put(
        `${import.meta.env.VITE_API_URL}/reimbursements/${id}/status`,
        { status, adminComment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Updated");
      fetchItems();
    } catch (_err) {
      toast.error("Failed to update");
    }
  };

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
                        <a className="text-primary font-bold text-[11px] hover:underline" href={i.receiptImageUrl} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        <span className="text-[11px] text-text-body/30 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold uppercase text-[11px]">{i.status}</td>
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
                        <button
                          onClick={() => updateStatus(i._id, "approved")}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white font-black text-[11px] flex items-center gap-2"
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(i._id, "rejected")}
                          className="px-3 py-2 rounded-lg bg-blood text-white font-black text-[11px] flex items-center gap-2"
                        >
                          <FaTimes /> Reject
                        </button>
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
    </div>
  );
};

export default ReimbursementsManager;

