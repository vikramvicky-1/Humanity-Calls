import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaEnvelope,
  FaGlobe,
  FaSignOutAlt,
  FaSave,
  FaHandHoldingHeart,
  FaExternalLinkAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaIdCard,
  FaCalendarAlt,
  FaPen,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useUser } from "../context/UserContext";
import axios from "axios";
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
    toast.success(
      `Language changed to ${languages.find((l) => l.code === lng)?.label}`,
    );
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
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [cancelToken, setCancelToken] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/become-a-member");
    } else {
      setName(user.name);
      fetchVolunteerStatus();
    }
  }, [user, navigate]);

  const fetchVolunteerStatus = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/volunteers/my-status`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.status !== "none") {
        setVolunteerStatus(response.data.status);
        setVolunteerData(response.data.volunteer);
      }
    } catch (err) {
      console.error("Failed to fetch volunteer status", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  if (!user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (name === user.name) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
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

  const handleDownloadIDCard = async () => {
    setShowModal(true);
    setProgress(0);
    setIsGenerating(true);

    const source = axios.CancelToken.source();
    setCancelToken(source);

    // Simulate progress while waiting for backend
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 400);

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/id-card/download/${volunteerData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
          cancelToken: source.token,
        },
      );

      clearInterval(interval);
      setProgress(100);

      // Small delay to show 100%
      setTimeout(() => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${volunteerData.volunteerId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setShowModal(false);
        setIsGenerating(false);
        toast.success("ID Card downloaded successfully!");
      }, 800);
    } catch (error) {
      clearInterval(interval);
      if (axios.isCancel(error)) {
        toast.info("Generation cancelled");
      } else {
        console.error("ID Card Download Error:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to generate ID card. Please try again.",
        );
      }
      setShowModal(false);
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    if (cancelToken) {
      cancelToken.cancel("User cancelled the generation");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4">
      <SEO title="My Profile | Humanity Calls" />

      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div
          className={`rounded-3xl shadow-xl border p-8 mb-8 text-center relative overflow-hidden transition-all duration-500 ${
            volunteerStatus === "active"
              ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-amber-200"
              : "bg-white border-border"
          }`}
        >
          {volunteerStatus === "active" ? (
            <div
              className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          ) : (
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blood"></div>
          )}

          <div className="relative inline-block mb-6">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold mx-auto shadow-xl border-4 border-white overflow-hidden bg-bg transition-transform duration-500 ${volunteerStatus === "active" ? "scale-110 shadow-primary/20 ring-4 ring-primary/10" : ""}`}
            >
              {volunteerData?.profilePicture ? (
                <img
                  src={volunteerData.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {volunteerStatus === "active" && (
              <div className="absolute -right-2 -bottom-2 bg-blue-600 rounded-full p-1.5 shadow-lg animate-bounce-slow">
                <MdVerified className="text-white text-2xl" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">
              {user.name}
            </h1>

            {volunteerStatus === "active" && volunteerData?.volunteerId && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-600 text-white text-xs font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-amber-600/20">
                  <FaIdCard className="text-white/80" />{" "}
                  {volunteerData.volunteerId}
                </div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest opacity-60">
                  Verified Volunteer
                </span>
              </div>
            )}

            {!volunteerData?.volunteerId && (
              <p className="text-text-body/60 font-medium">{user.email}</p>
            )}

            {volunteerStatus === "active" && (
              <p className="text-text-body/40 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2 justify-center">
                <FaCalendarAlt className="text-primary/60" />
                Member since{" "}
                {new Date(volunteerData?.joiningDate)
                  .toLocaleString("en-US", { month: "short", year: "numeric" })
                  .toUpperCase()}
              </p>
            )}
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Volunteer Status Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
              <FaHandHoldingHeart className="text-sm" /> Volunteer Status
            </h2>

            {isLoadingStatus ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <span className="text-text-body/60 font-medium italic">
                  Fetching status...
                </span>
              </div>
            ) : !volunteerStatus ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <div>
                  <h3 className="font-bold text-primary mb-1">
                    Become a Volunteer
                  </h3>
                  <p className="text-text-body/60 text-sm">
                    Join our mission to serve humanity.
                  </p>
                </div>
                <Link
                  to="/volunteer"
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  Join Now <FaExternalLinkAlt size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div
                  className={`p-6 rounded-2xl border flex items-center gap-4 ${
                    volunteerStatus === "active"
                      ? "bg-green-50 border-green-100 text-green-700"
                      : volunteerStatus === "pending"
                        ? "bg-amber-50 border-amber-100 text-amber-700"
                        : volunteerStatus === "rejected"
                          ? "bg-red-50 border-red-100 text-red-700"
                          : "bg-gray-50 border-gray-100 text-gray-700"
                  }`}
                >
                  <div className="text-2xl shrink-0">
                    {volunteerStatus === "active" && <FaCheckCircle />}
                    {volunteerStatus === "pending" && <FaClock />}
                    {volunteerStatus === "rejected" && <FaTimesCircle />}
                    {volunteerStatus === "banned" && <FaBan />}
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-xs mb-1">
                      Current Status
                    </h3>
                    <p className="font-black text-xl capitalize">
                      {volunteerStatus}
                    </p>
                    <p className="text-sm opacity-80 mt-1">
                      {volunteerStatus === "pending" &&
                        "Your application is under review."}
                      {volunteerStatus === "active" &&
                        "You are an official volunteer! Thank you."}
                      {volunteerStatus === "rejected" &&
                        "Your application was not approved."}
                      {volunteerStatus === "banned" &&
                        "Your volunteer status is suspended."}
                    </p>
                    {(volunteerStatus === "rejected" ||
                      volunteerStatus === "banned") &&
                      (volunteerData?.rejectionReason ||
                        volunteerData?.banReason) && (
                        <div className="mt-3 p-3 bg-white/50 rounded-xl border border-current/10 text-xs italic">
                          <span className="font-bold uppercase tracking-widest text-[10px] block mb-1">
                            Reason from Admin:
                          </span>
                          "
                          {volunteerStatus === "rejected"
                            ? volunteerData.rejectionReason
                            : volunteerData.banReason}
                          "
                        </div>
                      )}
                  </div>
                </div>

                {volunteerStatus === "active" && (
                  <button
                    onClick={handleDownloadIDCard}
                    disabled={isGenerating}
                    className="w-full p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-amber-600/20 hover:shadow-amber-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                      <FaIdCard className="text-2xl" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs opacity-80 font-bold tracking-[0.1em]">
                        Official Membership
                      </span>
                      <span className="text-lg">Download ID Card</span>
                    </div>
                  </button>
                )}

                {volunteerStatus === "rejected" && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <div>
                      <h3 className="font-bold text-primary mb-1">
                        Re-apply as Volunteer
                      </h3>
                      <p className="text-text-body/60 text-sm">
                        You can try applying again with updated information.
                      </p>
                    </div>
                    <Link
                      to="/volunteer"
                      className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                      Join Now <FaExternalLinkAlt size={12} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Update Name Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
              <FaUser className="text-sm" /> {t("profile.account_info")}
            </h2>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase tracking-widest flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    {t("profile.full_name")} <span className="text-blood">*</span>
                  </span>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-widest"
                    >
                      <FaPen size={10} /> Edit
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-6 py-4 border rounded-2xl outline-none transition-all font-medium ${
                      isEditing
                        ? "border-primary bg-bg/30 focus:ring-1 focus:ring-primary cursor-text"
                        : "border-border bg-gray-50 text-text-body/70 cursor-default select-none"
                    }`}
                    placeholder={t("profile.full_name_placeholder")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body/40 uppercase tracking-widest">
                  {t("profile.email_address_label")}
                </label>
                <div className="relative">
                  <div className="w-full px-6 py-4 border border-border bg-gray-50 rounded-2xl text-text-body/50 font-medium flex items-center gap-3">
                    <FaEnvelope className="text-gray-300" />
                    {user.email}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setName(user.name); setIsEditing(false); }}
                    className="flex-1 border border-border text-text-body font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-[2] bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        {t("profile.updating")}
                      </>
                    ) : (
                      <>
                        <FaSave /> {t("profile.save_changes")}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
              <FaGlobe className="text-sm" /> {t("profile.preferred_language")}
            </h2>
            <LanguageSelectorProfile />
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-blood mb-1 flex items-center gap-3">
                  <FaSignOutAlt className="text-sm" /> {t("profile.sign_out")}
                </h2>
                <p className="text-text-body/60 text-sm font-medium">
                  {t("profile.logout_confirm_text")}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-blood text-white font-bold hover:bg-blood/90 transition-all shadow-xl shadow-blood/20 active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {t("profile.logout")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <FaIdCard size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">
                  Generating ID Card
                </h3>
                <p className="text-text-body/60 text-sm font-medium mt-1">
                  Please wait while we prepare your official membership card...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">
                {progress}% Completed
              </p>

              <button
                onClick={handleCancelGeneration}
                className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FaTimesCircle /> Cancel Generation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
