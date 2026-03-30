import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserFriends,
  FaClipboardList,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaImages,
  FaPlusCircle
} from "react-icons/fa";
import hclogo from "../assets/humanitycallslogo.avif";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/volunteers?status=pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPendingRequestsCount(response.data.length);
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
    { id: "add-gallery", label: "Add Gallery", icon: <FaPlusCircle /> },
    { id: "gallery", label: "Gallery", icon: <FaImages /> },
    { id: "send-mails", label: "Send Mail", icon: <FaEnvelope /> },
    { id: "requests", label: "Volunteer Request", icon: <FaClipboardList /> },
    { id: "volunteers", label: "Volunteers", icon: <FaUserFriends /> },
  ];

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-border px-[5%] py-4 flex items-center justify-between z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <button
            className="lg:hidden text-primary p-2 hover:bg-bg rounded-lg transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <FaBars size={24} />
          </button>
          <div className="flex items-center gap-4">
            <img
              src={hclogo}
              width="50"
              height="50"
              className="object-contain"
              alt="Humanity Calls logo"
            />
            <span className="text-2xl font-black text-blood tracking-tighter hidden sm:block">
              Humanity Calls
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm font-bold text-text-body/60 uppercase tracking-widest">
            Admin Portal
          </span>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Collapsible Sidebar */}
        <aside
          className={`
          fixed lg:relative inset-y-0 left-0 bg-white border-r border-border z-[100] transform transition-all duration-300 ease-in-out shrink-0 flex flex-col
          ${isSidebarOpen ? "w-64" : "w-20"}
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="p-6 flex justify-between items-center border-b border-border shrink-0">
            {isSidebarOpen && (
              <span className="font-bold text-primary">Admin Menu</span>
            )}
            <button
              className="p-2 hover:bg-bg rounded-lg transition-colors text-primary hidden lg:block"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
            <button
              className="lg:hidden text-primary"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>

          <nav className="p-4 space-y-2 flex-grow overflow-y-auto overflow-x-hidden">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={`/admin/${item.id}`}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `
                  w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all
                  ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-body/60 hover:bg-bg hover:text-primary"}
                  ${!isSidebarOpen && "justify-center"}
                `}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.id === "requests" && pendingRequestsCount > 0 && (
                      <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-2 shadow-sm">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-blood hover:bg-blood/5 transition-all
                ${!isSidebarOpen && "justify-center"}
              `}
              title="Logout"
            >
              <FaSignOutAlt className="text-xl" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col">
          <div className="p-6 md:p-10 lg:p-12 flex-grow">
            <div className="max-w-6xl mx-auto w-full">
              <Outlet context={{ onStatusUpdate: fetchPendingCount }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
