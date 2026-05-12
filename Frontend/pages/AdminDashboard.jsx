import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserFriends,
  FaClipboardList,
  FaTint,
  FaMoneyCheckAlt,
  FaEnvelope,
  FaImages,
  FaPlusCircle,
  FaShieldAlt,
  FaImage,
  FaCommentDots,
  FaHeart,
  FaChartLine,
  FaBolt,
  FaSitemap,
} from "react-icons/fa";
import hclogo from "../assets/humanitycallslogo.avif";
import axios from "axios";
import { toast } from "react-toastify";

/* ── Per-nav-item color config ─────────────────────────────── */
const NAV_COLORS = {
  dashboard:   { bg: "bg-indigo-600",   text: "text-indigo-600",   light: "bg-indigo-50",   ring: "ring-indigo-200"  },
  volunteers:  { bg: "bg-indigo-500",   text: "text-indigo-500",   light: "bg-indigo-50",   ring: "ring-indigo-200"  },
  "send-mails":{ bg: "bg-violet-500",   text: "text-violet-500",   light: "bg-violet-50",   ring: "ring-violet-200"  },
  "blood-requests": { bg: "bg-rose-500", text: "text-rose-500", light: "bg-rose-50", ring: "ring-rose-200" },
  reimbursements: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50", ring: "ring-emerald-200" },
  forms: { bg: "bg-slate-700", text: "text-slate-700", light: "bg-slate-50", ring: "ring-slate-200" },
  "form-images":{ bg: "bg-blue-500",    text: "text-blue-500",     light: "bg-blue-50",      ring: "ring-blue-200"    },
  gallery:     { bg: "bg-teal-500",     text: "text-teal-500",     light: "bg-teal-50",     ring: "ring-teal-200"    },
  "add-gallery":{ bg: "bg-pink-500",   text: "text-pink-500",     light: "bg-pink-50",     ring: "ring-pink-200"    },
  feedback:     { bg: "bg-yellow-500",  text: "text-yellow-600",   light: "bg-yellow-50",   ring: "ring-yellow-200"  },
  donations:    { bg: "bg-rose-500",    text: "text-rose-500",     light: "bg-rose-50",     ring: "ring-rose-200"    },
  "emergency-fundraisers": { bg: "bg-red-600", text: "text-red-600", light: "bg-red-50", ring: "ring-red-200" },
  "team-hierarchy": { bg: "bg-cyan-600", text: "text-cyan-600", light: "bg-cyan-50", ring: "ring-cyan-200" },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [openBloodRequestsCount, setOpenBloodRequestsCount] = useState(0);
  const [pendingReimbursementsCount, setPendingReimbursementsCount] = useState(0);
  const [pendingDonationsCount, setPendingDonationsCount] = useState(0);
  const [pendingEmergencyDonationsCount, setPendingEmergencyDonationsCount] = useState(0);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    } else {
      fetchPendingCount();
    }
  }, [navigate, location.pathname]);

  const fetchPendingCount = async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };
      const [volunteerRes, bloodRes, reimbRes, donationRes, feedbackRes, emergencyDonationRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/volunteers?status=pending`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/blood-requests?status=open`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/reimbursements`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/donations`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/feedback`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/emergency-donations/pending-count`, { headers }),
      ]);

      setPendingRequestsCount(volunteerRes.data.length);
      setOpenBloodRequestsCount(bloodRes.data.length);
      setPendingReimbursementsCount(
        (reimbRes.data || []).filter((r) => r.status === "pending").length,
      );
      setPendingDonationsCount(
        (donationRes.data || []).filter((d) => d.status === "pending").length,
      );
      setPendingFeedbackCount(
        (feedbackRes.data || []).filter((f) => f.status === "pending").length,
      );
      setPendingEmergencyDonationsCount(emergencyDonationRes.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    toast.info("Logged out successfully");
    navigate("/admin/login");
  };

  const menuItems = [
    { id: "dashboard",    label: "Dashboard",        icon: <FaChartLine /> },
    { id: "volunteers",   label: "Volunteers",       icon: <FaUserFriends />, badge: pendingRequestsCount },
    { id: "send-mails",   label: "Send Mails",        icon: <FaEnvelope />     },
    { id: "forms",        label: "Forms",             icon: <FaClipboardList /> },
    { id: "blood-requests", label: "Blood Requests",  icon: <FaTint />, badge: openBloodRequestsCount },
    { id: "reimbursements", label: "Reimbursements",  icon: <FaMoneyCheckAlt />, badge: pendingReimbursementsCount },
    { id: "donations",      label: "Donations",       icon: <FaHeart />,         badge: pendingDonationsCount },
    { id: "emergency-fundraisers", label: "Emergency funding", icon: <FaBolt />, badge: pendingEmergencyDonationsCount },
    { id: "team-hierarchy", label: "Team hierarchy", icon: <FaSitemap /> },
    { id: "form-images",  label: "Form Images",       icon: <FaImage />        },
    { id: "gallery",      label: "Gallery",           icon: <FaImages />       },
    { id: "add-gallery",  label: "Add Gallery",       icon: <FaPlusCircle />   },
    { id: "feedback",      label: "Feedback",           icon: <FaCommentDots />,  badge: pendingFeedbackCount },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F8] flex flex-col">

      {/* ── Top Navbar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FaBars size={20} />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
              <img src={hclogo} alt="HC" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-none tracking-tight">Humanity Calls</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Online</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
            <FaShieldAlt size={11} className="text-slate-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admin</span>
          </div>
        </div>
      </nav>

      {/* ── Body: Sidebar + Main ─────────────────────────────────── */}
      <div className="flex flex-1 relative">

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-72 bg-[#1E1F2E] z-[100] transform transition-transform duration-300 ease-in-out
            flex flex-col shadow-2xl overflow-x-hidden
            ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:w-56 lg:shrink-0
          `}
        >
          {/* Sidebar Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <FaShieldAlt size={14} className="text-white/80" />
              </div>
              <div>
                <p className="text-[13px] font-black text-white leading-none tracking-tight">Admin Panel</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Management</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-3 mb-2">Navigation</p>
            {menuItems.map((item) => {
              const colors = NAV_COLORS[item.id] || {};
              return (
                <NavLink
                  key={item.id}
                  to={`/admin/${item.id}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  title={item.label}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl font-semibold transition-all duration-200
                    ${isActive
                      ? `${colors.light} ${colors.text} shadow-sm ring-1 ${colors.ring}`
                      : "text-white/50 hover:text-white hover:bg-white/8"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 transition-all relative
                        ${isActive ? `${colors.bg} text-white shadow-lg` : "bg-white/8 text-white/50 group-hover:bg-white/15 group-hover:text-white"}`}
                      >
                        {item.icon}
                        {item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#1E1F2E] rounded-full animate-pulse" />
                        )}
                      </span>
                      <span className="text-sm truncate flex-1">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full ${colors.bg}`} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold text-xs transition-all duration-200 group"
            >
              <span className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                <FaSignOutAlt size={14} />
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 min-h-full">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet context={{ 
                onStatusUpdate: fetchPendingCount,
                pendingRequestsCount: pendingRequestsCount 
              }} />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminDashboard;
