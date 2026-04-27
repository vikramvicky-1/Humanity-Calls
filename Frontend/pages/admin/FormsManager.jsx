import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaWpforms, FaSearch, FaTrash } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

const TABS = [
  { id: "blood_donation_public", label: "Blood Donation (Public)" },
  { id: "blood_requests", label: "Blood Requests" },
  { id: "animal_rescue_request", label: "Animal Rescue (Request)" },
  { id: "animal_adopt_now", label: "Animal Rescue (Adopt)" },
  { id: "poor_request_help", label: "Poor & Needy (Request Help)" },
  { id: "poor_help_now", label: "Poor & Needy (Help Now)" },
];

const FormsManager = () => {
  const { onStatusUpdate } = useOutletContext();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRows = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === "blood_donation_public") {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/public-submissions?kind=blood_donation`,
          { headers },
        );
        setRows((res.data || []).map((r) => ({ _id: r._id, createdAt: r.createdAt, data: r.data, kind: r.kind })));
      } else if (activeTab === "blood_requests") {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/blood-requests`, { headers });
        setRows((res.data || []).map((r) => ({ _id: r._id, createdAt: r.createdAt, data: r, kind: "blood_requests" })));
      } else {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/form-submissions?kind=${activeTab}`,
          { headers },
        );
        setRows((res.data || []).map((r) => ({ _id: r._id, createdAt: r.createdAt, data: r.data, user: r.user, kind: r.kind })));
      }

      if (onStatusUpdate) onStatusUpdate();
    } catch (_err) {
      toast.error("Failed to fetch submissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r.data || {}).toLowerCase().includes(q));
  }, [rows, searchQuery]);

  const deleteRow = async (id) => {
    if (activeTab === "blood_donation_public" || activeTab === "blood_requests") {
      toast.info("Delete is disabled for this tab");
      return;
    }
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(`${import.meta.env.VITE_API_URL}/form-submissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted");
      fetchRows();
    } catch (_err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <FaWpforms /> Forms
          </h2>
          <div className="relative w-full md:w-[420px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/40" />
            <input
              type="text"
              placeholder="Search in submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 bg-bg p-1.5 rounded-2xl w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                activeTab === t.id ? "bg-primary text-white shadow-md" : "text-text-body/60 hover:text-primary hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-body/60 font-medium italic">Loading submissions...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div key={r._id} className="border border-border rounded-2xl p-5 bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-text-body/40">
                      {r.kind}
                    </div>
                    <div className="text-[12px] font-bold text-text-body/60">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString("en-GB") : "—"}
                      {r.user?.email ? ` • ${r.user.email}` : ""}
                    </div>
                  </div>
                  {activeTab !== "blood_donation_public" && activeTab !== "blood_requests" && (
                    <button
                      onClick={() => deleteRow(r._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blood/10 text-blood font-black text-[11px] hover:bg-blood/15"
                    >
                      <FaTrash /> Delete
                    </button>
                  )}
                </div>

                <pre className="mt-4 text-[12px] bg-bg rounded-xl p-4 overflow-auto">
{JSON.stringify(r.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-text-body/60 font-bold">No submissions found</div>
        )}
      </div>
    </div>
  );
};

export default FormsManager;

