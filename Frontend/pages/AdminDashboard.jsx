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
} from "react-icons/fa";
import hclogo from "../assets/humanitycallslogo.avif";
import axios from "axios";
import { toast } from "react-toastify";

/* ── Per-nav-item color config ─────────────────────────────── */
const NAV_COLORS = {
  volunteers:  { bg: "bg-indigo-500",   text: "text-indigo-500",   light: "bg-indigo-50",   ring: "ring-indigo-200"  },
  "send-mails":{ bg: "bg-violet-500",   text: "text-violet-500",   light: "bg-violet-50",   ring: "ring-violet-200"  },
  requests:    { bg: "bg-amber-500",    text: "text-amber-500",    light: "bg-amber-50",    ring: "ring-amber-200"   },
  "blood-requests": { bg: "bg-rose-500", text: "text-rose-500", light: "bg-rose-50", ring: "ring-rose-200" },
  reimbursements: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50", ring: "ring-emerald-200" },
  forms: { bg: "bg-slate-700", text: "text-slate-700", light: "bg-slate-50", ring: "ring-slate-200" },
  "form-images":{ bg: "bg-blue-500",    text: "text-blue-500",     light: "bg-blue-50",      ring: "ring-blue-200"    },
  gallery:     { bg: "bg-teal-500",     text: "text-teal-500",     light: "bg-teal-50",     ring: "ring-teal-200"    },
  "add-gallery":{ bg: "bg-pink-500",   text: "text-pink-500",     light: "bg-pink-50",     ring: "ring-pink-200"    },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [openBloodRequestsCount, setOpenBloodRequestsCount] = useState(0);
  const [pendingReimbursementsCount, setPendingReimbursementsCount] = useState(0);

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
      const [volunteerRes, bloodRes, reimbRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/volunteers?status=pending`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/blood-requests?status=open`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/reimbursements`, { headers }),
      ]);

      setPendingRequestsCount(volunteerRes.data.length);
      setOpenBloodRequestsCount(bloodRes.data.length);
      setPendingReimbursementsCount(
        (reimbRes.data || []).filter((r) => r.status === "pending").length,
      );
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
    { id: "volunteers",   label: "Volunteers",       icon: <FaUserFriends />  },
    { id: "send-mails",   label: "Send Mails",        icon: <FaEnvelope />     },
    { id: "requests",     label: "Requests",          icon: <FaClipboardList />, badge: pendingRequestsCount },
    { id: "forms",        label: "Forms",             icon: <FaClipboardList /> },
    { id: "blood-requests", label: "Blood Requests",  icon: <FaTint />, badge: openBloodRequestsCount },
    { id: "reimbursements", label: "Reimbursements",  icon: <FaMoneyCheckAlt />, badge: pendingReimbursementsCount },
    { id: "form-images",  label: "Form Images",       icon: <FaImage />        },
    { id: "gallery",      label: "Gallery",           icon: <FaImages />       },
    { id: "add-gallery",  label: "Add Gallery",       icon: <FaPlusCircle />   },
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
            flex flex-col shadow-2xl
            ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0
          `}
        >
          {/* Sidebar Header */}
          <div className="px-6 py-6 flex items-center justify-between border-b border-white/5">
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
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-3 mb-3">Navigation</p>
            {menuItems.map((item) => {
              const colors = NAV_COLORS[item.id] || {};
              return (
                <NavLink
                  key={item.id}
                  to={`/admin/${item.id}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  title={item.label}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
                    ${isActive
                      ? `${colors.light} ${colors.text} shadow-sm ring-1 ${colors.ring}`
                      : "text-white/50 hover:text-white hover:bg-white/8"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all
                        ${isActive ? `${colors.bg} text-white shadow-lg` : "bg-white/8 text-white/50 group-hover:bg-white/15 group-hover:text-white"}`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-sm whitespace-nowrap flex-1">{item.label}</span>
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
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold text-sm transition-all duration-200 group"
            >
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
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
              <Outlet context={{ onStatusUpdate: fetchPendingCount }} />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminDashboard;
