import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSave, FaUsers } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LEADER_LABEL = "Team Leader";
const COORD_LABEL = "Coordinator";
const MEMBER_LABEL = "Team Member";

const FamilyTreeRolesManager = () => {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("adminToken");
        const { data } = await axios.get(`${API}/team/roster`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoster(data.roster || []);
        const d = {};
        (data.roster || []).forEach((r) => {
          d[r.userId] = { teamRole: r.teamRole || "" };
        });
        setDraft(d);
      } catch {
        toast.error("Failed to load team roster");
        setRoster([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setRole = (userId, teamRole) => {
    setDraft((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), teamRole },
    }));
  };

  const dirtyEntries = useMemo(() => {
    return roster.filter((r) => {
      const cur = draft[r.userId]?.teamRole ?? "";
      return cur !== (r.teamRole || "");
    });
  }, [roster, draft]);

  const saveAll = async () => {
    if (!dirtyEntries.length) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await Promise.all(
        dirtyEntries.map((r) =>
          axios.put(
            `${API}/team/user/${r.userId}`,
            { teamRole: draft[r.userId]?.teamRole ?? "" },
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ),
      );
      toast.success("Team roles saved. The public Our Team page will reflect these tiers.");
      setRoster((prev) =>
        prev.map((row) => ({
          ...row,
          teamRole: draft[row.userId]?.teamRole ?? row.teamRole,
        })),
      );
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const memberButtonClass = (active) =>
    `px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border ${
      active ? "bg-slate-800 text-white border-slate-800" : "bg-white border-border hover:border-primary/40"
    }`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-primary flex items-center gap-3">
              <FaUsers /> Family tree roles
            </h1>
            <p className="text-sm text-text-body/60 mt-1 max-w-2xl">
              Assign how each person appears in the public Our Team hierarchy. The volunteer&apos;s chosen role
              preference appears as a small label under the photo; the tree tier uses the role you set here (Team
              Leader, Coordinator, or Member).
            </p>
          </div>
          <button
            type="button"
            onClick={saveAll}
            disabled={saving || !dirtyEntries.length}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
          >
            <FaSave /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center font-bold text-text-body/50">Loading users…</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-[10px] font-black uppercase tracking-widest text-text-body/50">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Form role (watermark)</th>
                  <th className="px-4 py-3 text-right">Tree role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roster.map((r) => {
                  const roleNow = draft[r.userId]?.teamRole ?? r.teamRole ?? "";
                  return (
                    <tr key={r.userId} className="hover:bg-bg/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-bg shrink-0">
                            {r.profilePicture && !/\.pdf(\?|$)/i.test(r.profilePicture) ? (
                              <img src={r.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-black text-primary/40">
                                {(r.name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            {r.volunteerRolePreference ? (
                              <span className="absolute bottom-0 left-0 right-0 text-[5px] font-black uppercase text-white bg-black/55 text-center truncate px-0.5 leading-none py-0.5">
                                {r.volunteerRolePreference}
                              </span>
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-text-body truncate">{r.name}</div>
                            <div className="text-[11px] text-text-body/45 truncate">{r.email}</div>
                            {r.volunteerId ? (
                              <div className="text-[10px] font-black text-primary/70 mt-0.5">{r.volunteerId}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-text-body/60 max-w-[220px]">
                        {r.volunteerRolePreference || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRole(r.userId, LEADER_LABEL)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border ${
                              roleNow === LEADER_LABEL
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-border hover:border-primary/40"
                            }`}
                          >
                            Add as team leader
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole(r.userId, COORD_LABEL)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border ${
                              roleNow === COORD_LABEL
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-border hover:border-primary/40"
                            }`}
                          >
                            Add as coordinator
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole(r.userId, MEMBER_LABEL)}
                            className={memberButtonClass(roleNow === MEMBER_LABEL)}
                          >
                            Set as member
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole(r.userId, "")}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border border-dashed border-border text-text-body/50 hover:border-blood/40"
                          >
                            Clear role
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
    </div>
  );
};

export default FamilyTreeRolesManager;
