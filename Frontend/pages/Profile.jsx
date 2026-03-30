import React, { useState, useEffect, useRef } from "react";
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
  FaCamera,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import SEO from "../components/SEO";
import ProfilePictureCropper from "../components/ProfilePictureCropper";
import QRCode from "react-qr-code";

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
  const { user, logout, updateProfile, verifyProfileEmail } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [cancelToken, setCancelToken] = useState(null);
  // Profile picture crop state
  const [rawProfileImage, setRawProfileImage] = useState(null);
  const [showPhotoCropModal, setShowPhotoCropModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/become-a-member");
    } else {
      setName(user.name);
      setPhone(user.phone || "");
      fetchVolunteerStatus();
    }
  }, [user, navigate]);

  const fetchVolunteerStatus = async () => {
    const token = sessionStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/volunteers/my-status`,
        { headers, withCredentials: true },
      );
      if (response.data.status !== "none") {
        setVolunteerStatus(response.data.status);
        setVolunteerData(response.data.volunteer);
        if (response.data.volunteer.phone) {
          setPhone(response.data.volunteer.phone);
        }
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
    if (name === user.name && phone === (user.phone || "")) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ name, phone });
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
      navigate("/");
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  const handleSendVerificationOtp = async () => {
    setIsSendingOtp(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-otp`, { email: user.email });
      toast.success("Verification code sent to your email!");
      setShowVerificationModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationOtp || verificationOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await verifyProfileEmail(verificationOtp);
      toast.success("Email verified successfully!");
      setShowVerificationModal(false);
      setVerificationOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifyingOtp(false);
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
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/id-card/download/${volunteerData._id}`,
        {
          headers,
          withCredentials: true,
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawProfileImage(reader.result);
      setShowPhotoCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleProfileCropDone = async (croppedFile) => {
    setShowPhotoCropModal(false);
    setRawProfileImage(null);
    setIsUploadingPhoto(true);
    try {
      const token = sessionStorage.getItem("token");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      // 1. Upload to Cloudinary via existing upload endpoint
      const uploadData = new FormData();
      uploadData.append("image", croppedFile);
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/volunteers/upload`,
        uploadData,
        { headers: { "Content-Type": "multipart/form-data", ...authHeaders }, withCredentials: true }
      );
      const newUrl = uploadRes.data.imageUrl;

      // 2. Patch volunteer record
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/volunteers/my-profile-picture`,
        { profilePicture: newUrl },
        { headers: authHeaders, withCredentials: true }
      );

      // 3. Refresh local volunteer data
      setVolunteerData((prev) => ({ ...prev, profilePicture: newUrl }));
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error("Photo update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile picture");
    } finally {
      setIsUploadingPhoto(false);
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

          <div className="relative inline-block mb-6 group/avatar">
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

            {!!volunteerStatus ? (
              <>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  id="profile-photo-edit"
                />
                <label
                  htmlFor="profile-photo-edit"
                  title="Change profile photo"
                  className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover/avatar:bg-black/45 transition-all cursor-pointer"
                >
                  {isUploadingPhoto ? (
                    <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaCamera className="text-white text-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity drop-shadow-lg" />
                  )}
                </label>
              </>
            ) : null}

            {(volunteerStatus === "active" || volunteerStatus === "temporary") && (
              <div className={`absolute -right-2 -bottom-2 rounded-full p-1.5 shadow-lg animate-bounce-slow pointer-events-none ${volunteerStatus === "active" ? "bg-blue-600" : "bg-orange-500"}`}>
                <MdVerified className="text-white text-2xl" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">
              {user.name}
            </h1>

            {(volunteerStatus === "active" || volunteerStatus === "temporary") && volunteerData?.volunteerId && (
              <div className="flex flex-col items-center gap-1">
                <div className={`flex items-center gap-2 px-4 py-1.5 text-white text-xs font-black rounded-full uppercase tracking-[0.2em] shadow-lg ${volunteerStatus === "active" ? "bg-amber-600 shadow-amber-600/20" : "bg-orange-600 shadow-orange-600/20"}`}>
                  <FaIdCard className="text-white/80" />{" "}
                  {volunteerData.volunteerId}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${volunteerStatus === "active" ? "text-amber-600" : "text-orange-600"}`}>
                  {volunteerStatus === "active" ? "Verified Volunteer" : "Temporary Volunteer"}
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

            <div className={`mt-4 w-full flex items-center justify-center p-3 rounded-2xl border ${user.isVerified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {user.isVerified ? (
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-2 text-green-700 font-bold uppercase tracking-widest text-xs">
                     <MdVerified className="text-xl" /> Email Verified
                   </div>
                </div>
              ) : (
                <div className="flex flex-col w-full gap-4 px-2">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-widest text-xs content-center">
                       <FaTimesCircle className="text-xl" /> Email Unverified
                     </div>
                     {!showVerificationModal && (
                       <button
                         onClick={handleSendVerificationOtp}
                         disabled={isSendingOtp}
                         className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                       >
                         {isSendingOtp ? (
                           <>
                             <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                             Sending...
                           </>
                         ) : (
                           "Verify Now"
                         )}
                       </button>
                     )}
                   </div>
                   
                   {/* Inline OTP Field */}
                   {showVerificationModal && (
                     <div className="mt-2 p-4 bg-white rounded-xl border border-red-100 flex flex-col gap-3">
                       <p className="text-xs text-gray-500 font-medium">Enter the 6-digit code sent to your email:</p>
                       <div className="flex flex-col sm:flex-row gap-2">
                         <input
                           type="text"
                           maxLength="6"
                           value={verificationOtp}
                           onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, ""))}
                           placeholder="000000"
                           className="w-full sm:flex-1 text-center text-lg font-black tracking-[0.2em] px-3 py-3 sm:py-2 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-gray-300"
                         />
                         <button
                           onClick={handleVerifyEmail}
                           disabled={isVerifyingOtp || verificationOtp.length !== 6}
                           className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-red-600 text-white font-bold rounded-lg shadow-md active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center sm:min-w-[100px]"
                         >
                           {isVerifyingOtp ? (
                             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           ) : (
                             "Verify"
                           )}
                         </button>
                       </div>
                       <button
                         onClick={handleSendVerificationOtp}
                         disabled={isSendingOtp}
                         className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-widest self-start mt-1"
                       >
                         {isSendingOtp ? "Resending..." : "Resend Code"}
                       </button>
                     </div>
                   )}
                </div>
              )}
            </div>

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
                        : volunteerStatus === "temporary"
                          ? "bg-orange-50 border-orange-200 text-orange-700"
                          : volunteerStatus === "rejected"
                            ? "bg-red-50 border-red-100 text-red-700"
                            : "bg-gray-50 border-gray-100 text-gray-700"
                  }`}
                >
                  <div className="text-2xl shrink-0">
                    {volunteerStatus === "active" && <FaCheckCircle />}
                    {volunteerStatus === "pending" && <FaClock />}
                    {volunteerStatus === "temporary" && <FaCheckCircle />}
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
                      {volunteerStatus === "temporary" &&
                        "You are an active temporary volunteer!"}
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
                  !user?.isVerified ? (
                    <div className="w-full p-6 bg-gray-100 border border-gray-200 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-center flex flex-col items-center justify-center gap-2 cursor-not-allowed">
                      <FaTimesCircle className="text-2xl text-red-400 mb-1" />
                      Verify Mail to Download ID
                    </div>
                  ) : (
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
                  )
                )}

                {volunteerStatus === "temporary" && volunteerData?.volunteerId && (
                  !user?.isVerified ? (
                    <div className="w-full p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-not-allowed">
                      <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-xl mb-2">
                        <FaTimesCircle />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-500 mb-1 text-center">
                          Verify Mail to Access Your ID
                        </h3>
                        <p className="text-gray-400 text-sm font-medium text-center">
                          You must verify your email address to view your QR code.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl flex flex-col items-center justify-center gap-4">
                      <span className="block text-xs font-black tracking-[0.1em] text-orange-600 uppercase text-center">
                        Temporary ID Verification
                      </span>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center justify-center">
                        <QRCode
                          value={`https://humanitycalls.org/verify/${volunteerData.volunteerId}`}
                          size={150}
                          level="M"
                        />
                      </div>
                      <p className="text-xs font-bold text-orange-700 text-center max-w-xs">
                        Scan this QR code to verify your temporary volunteer identity.
                      </p>
                    </div>
                  )
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-body uppercase tracking-widest flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    Phone Number
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(val);
                    }}
                    readOnly={!isEditing}
                    className={`w-full px-6 py-4 border rounded-2xl outline-none transition-all font-medium ${
                      isEditing
                        ? "border-primary bg-bg/30 focus:ring-1 focus:ring-primary cursor-text"
                        : "border-border bg-gray-50 text-text-body/70 cursor-default select-none"
                    }`}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { 
                      setName(user.name); 
                      setPhone(user.phone || "");
                      setIsEditing(false); 
                    }}
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

      {/* Profile Picture Crop Modal */}
      {showPhotoCropModal && rawProfileImage && (
        <ProfilePictureCropper
          imageSrc={rawProfileImage}
          onCropDone={handleProfileCropDone}
          onCancel={() => { setShowPhotoCropModal(false); setRawProfileImage(null); }}
        />
      )}

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
