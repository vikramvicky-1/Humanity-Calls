import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaUser, FaEnvelope, FaGlobe, FaSignOutAlt, FaSave } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import SEO from "../components/SEO";

const LanguageSelectorProfile = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: "en", label: "English" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "te", label: "తెలుగు" },
    { code: "ta", label: "தமிழ்" },
    { code: "ml", label: "മലയാളം" },
    { code: "hi", label: "हिन्दी" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    toast.success(`Language changed to ${languages.find(l => l.code === lng)?.label}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
            i18n.language === lang.code
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
              : "bg-white text-text-body border-border hover:border-primary hover:text-primary"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout, updateProfile } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/become-a-member");
    } else {
      setName(user.name);
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (name === user.name) return;
    
    setIsUpdating(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4">
      <SEO title="My Profile | Humanity Calls" />
      
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-border p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blood"></div>
          
          <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-xl shadow-primary/20 border-4 border-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-1 uppercase tracking-tight">{user.name}</h1>
          <p className="text-text-body/60 font-medium">{user.email}</p>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Update Name Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
              <FaUser className="text-sm" /> Account Information
            </h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase tracking-widest flex items-center gap-2">
                  Full Name <span className="text-blood">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 border border-border bg-bg/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body/40 uppercase tracking-widest">
                  Email Address (Cannot be changed)
                </label>
                <div className="relative">
                  <div className="w-full px-6 py-4 border border-border bg-gray-50 rounded-2xl text-text-body/50 font-medium flex items-center gap-3">
                    <FaEnvelope className="text-gray-300" />
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating || name === user.name}
                className="w-full bg-primary text-white font-bold py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
              <FaGlobe className="text-sm" /> Preferred Language
            </h2>
            <LanguageSelectorProfile />
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-blood mb-1 flex items-center gap-3">
                  <FaSignOutAlt className="text-sm" /> Sign Out
                </h2>
                <p className="text-text-body/60 text-sm font-medium">Are you sure you want to log out of your account?</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-blood text-white font-bold hover:bg-blood/90 transition-all shadow-xl shadow-blood/20 active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
