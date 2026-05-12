import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  HandHeart,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AnalyticsDashboard = () => {
  const [range, setRange] = useState("30d");
  const [graphMetric, setGraphMetric] = useState("volunteers");
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [emergencySummary, setEmergencySummary] = useState(null);
  const [loadingEmergency, setLoadingEmergency] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/analytics/stats?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchGraphData = async () => {
    setLoadingGraph(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/analytics/graph?metric=${graphMetric}&range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setGraphData(data);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setLoadingGraph(false);
    }
  };

  const fetchEmergencySummary = async () => {
    setLoadingEmergency(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/emergency-analytics/summary?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEmergencySummary(data);
    } catch (error) {
      console.error("Error fetching emergency analytics:", error);
      setEmergencySummary(null);
    } finally {
      setLoadingEmergency(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEmergencySummary();
  }, [range]);

  useEffect(() => {
    fetchGraphData();
  }, [graphMetric, range]);

  const cards = [
    {
      title: "Total Volunteers",
      value: stats?.volunteersCount || 0,
      icon: <Users className="w-6 h-6" />,
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
      lightColor: "bg-indigo-50",
    },
    {
      title: "Active Users",
      value: stats?.usersCount || 0,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      lightColor: "bg-purple-50",
    },
    {
      title: "Donations Received",
      value: `₹${stats?.totalDonations?.toLocaleString() || 0}`,
      icon: <HandHeart className="w-6 h-6" />,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      lightColor: "bg-emerald-50",
    },
    {
      title: "Reimbursed Amount",
      value: `₹${stats?.totalReimbursed?.toLocaleString() || 0}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-rose-500",
      textColor: "text-rose-500",
      lightColor: "bg-rose-50",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-lg font-black text-slate-800">
            {graphMetric === "donations" || graphMetric === "reimbursements"
              ? "₹"
              : ""}
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Real-time performance analytics for Humanity Calls
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {["7d", "30d", "all"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                range === r
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {loadingStats
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 h-24 animate-pulse border border-slate-100"
                  />
                ))
            : cards.map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2 rounded-xl ${card.lightColor} ${card.textColor} transition-colors duration-300 group-hover:bg-opacity-100`}
                    >
                      {React.cloneElement(card.icon, { className: "w-5 h-5" })}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <ArrowUpRight size={12} />
                      <span>Live</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {card.title}
                    </p>
                    <p className="text-xl font-black text-slate-800 leading-tight">
                      {card.value}
                    </p>
                  </div>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-50 text-red-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 leading-none">Emergency funding engagement</h3>
            <p className="text-slate-500 text-[10px] font-medium mt-1 max-w-3xl">
              Anonymous page events for the selected range: opens, shares, link copies, banner downloads, donation modal
              opens, and submitted donation forms. Approved offline/UPI emergency donations are summarized separately.
            </p>
          </div>
        </div>
        {loadingEmergency ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : emergencySummary ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              ["list_view", "List opens"],
              ["detail_view", "Campaign detail views"],
              ["list_card_open", "Campaign card taps"],
              ["fab_click", "Floating button taps"],
              ["home_section_view", "Home section loads"],
              ["popup_impression", "Home popup shown"],
              ["share_whatsapp", "WhatsApp share taps"],
              ["share_twitter", "X / Twitter share taps"],
              ["share_facebook", "Facebook share taps"],
              ["share_telegram", "Telegram share taps"],
              ["copy_link", "Copy link successes"],
              ["download_banner", "Banner downloads"],
              ["donate_form_open", "Donate modal opens"],
              ["donation_submit", "Donation forms submitted"],
            ].map(([key, label]) => (
              <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-snug">{label}</p>
                <p className="text-lg font-black text-slate-800 mt-1">{emergencySummary.events?.[key] ?? 0}</p>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/90 p-4 col-span-2 sm:col-span-3 lg:col-span-4">
              <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">Approved emergency donations (bank/UPI)</p>
              <p className="text-xl font-black text-emerald-950 mt-1">
                {emergencySummary.donations?.approvedCount ?? 0} recorded — ₹
                {(emergencySummary.donations?.approvedAmount || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 font-medium py-4">Emergency analytics unavailable.</p>
        )}
      </div>

      {/* Graph Section */}
      <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 leading-none">
              Growth Analysis
            </h3>
            <p className="text-slate-500 text-[10px] font-medium mt-1">
              Visualization of selected metric over time
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "volunteers", label: "Volunteers", color: "bg-indigo-500" },
              { id: "users", label: "Users", color: "bg-purple-500" },
              { id: "donations", label: "Donations", color: "bg-emerald-500" },
              {
                id: "reimbursements",
                label: "Reimbursements",
                color: "bg-rose-500",
              },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setGraphMetric(m.id)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 border ${
                  graphMetric === m.id
                    ? `${m.color} border-${m.color.split("-")[1]}-500 text-white shadow-md`
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[380px] w-full relative">
          {loadingGraph && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-2xl">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      graphMetric === "volunteers"
                        ? "#6366f1"
                        : graphMetric === "users"
                          ? "#a855f7"
                          : graphMetric === "donations"
                            ? "#10b981"
                            : "#f43f5e"
                    }
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      graphMetric === "volunteers"
                        ? "#6366f1"
                        : graphMetric === "users"
                          ? "#a855f7"
                          : graphMetric === "donations"
                            ? "#10b981"
                            : "#f43f5e"
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }}
                dy={10}
                interval={
                  range === "7d"
                    ? 0
                    : range === "30d"
                      ? 4
                      : Math.max(0, Math.floor(graphData.length / 8))
                }
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  });
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={
                  graphMetric === "volunteers"
                    ? "#6366f1"
                    : graphMetric === "users"
                      ? "#a855f7"
                      : graphMetric === "donations"
                        ? "#10b981"
                        : "#f43f5e"
                }
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorValue)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
