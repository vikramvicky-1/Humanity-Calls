import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import axios from "axios";

const Node = ({ node, depth = 0 }) => {
  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-sm"
        style={{ marginLeft: depth * 16 }}
      >
        <div>
          <div className="text-sm font-black text-text-body">{node.name}</div>
          <div className="text-[11px] text-text-body/50 font-bold">{node.teamRole || "Member"}</div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
          Team
        </div>
      </div>

      {node.children?.length > 0 && (
        <div className="space-y-3">
          {node.children.map((c) => (
            <Node key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const OurTeam = () => {
  const [data, setData] = useState({ roots: [], orphans: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/team/tree`)
      .then((res) => setData(res.data))
      .catch(() => setData({ roots: [], orphans: [], total: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-bg min-h-screen py-24">
      <SEO title="Our Team | Humanity Calls" description="Team hierarchy and collaborators at Humanity Calls." />

      <div className="max-w-5xl mx-auto px-[5%]">
        <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a] tracking-tight">
          Our <span className="text-primary italic">Team</span>
        </h1>
        <p className="mt-4 text-text-body/60 max-w-2xl">
          A simple team tree showing who works under whom. (Admins can update roles & reporting structure.)
        </p>

        <div className="mt-10">
          {loading ? (
            <div className="py-20 text-center text-text-body/60 font-bold">Loading team...</div>
          ) : (
            <div className="space-y-8">
              {data.roots?.length > 0 ? (
                <div className="space-y-4">
                  {data.roots.map((r) => (
                    <Node key={r.id} node={r} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-text-body/60 font-bold">
                  No team members found yet.
                </div>
              )}

              {data.orphans?.length > 0 && (
                <div className="mt-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-text-body/40 mb-3">
                    Unassigned / Orphans
                  </div>
                  <div className="space-y-3">
                    {data.orphans.map((o) => (
                      <Node key={o.id} node={o} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OurTeam;

