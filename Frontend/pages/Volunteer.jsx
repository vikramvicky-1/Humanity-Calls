import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import withFormAuth from "../components/withFormAuth";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimes, FaCamera, FaInfoCircle } from "react-icons/fa";
import hclogo from "../assets/humanitycallslogo.avif";

gsap.registerPlugin(ScrollTrigger);

const Volunteer = ({ user, isFieldDisabled, renderSubmitButton }) => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [govIdPreview, setGovIdPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !user) {
        setIsCheckingStatus(false);
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/volunteers/my-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.status !== "none") {
          setVolunteerStatus(response.data.status);
        }
      } catch (error) {
        console.error("Error fetching volunteer status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    fetchStatus();
  }, [user]);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;

    const ctx = gsap.context(() => {
      const title = document.querySelector('[data-animation="vol-title"]');
      const form = document.querySelector('[data-animation="vol-form"]');

      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: title, start: "top 80%", once: true },
          },
        );
      }

      if (form) {
        gsap.fromTo(
          form,
          { opacity: 0, y: isMobile ? 20 : 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: form, start: "top 80%", once: true },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [i18n.language]);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    gender: "",
    interest: "",
    govIdType: "",
    govIdImage: "",
    profilePicture: "",
    bloodGroup: "",
    dob: "",
    joiningDate: "",
    termsAccepted: false,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleFileChange = (e, type = "govId") => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    if (type === "profile") {
      setSelectedProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(file);
      setGovIdPreview(URL.createObjectURL(file));
    }
  };

  const validateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.termsAccepted) {
      toast.error("Please accept the Terms and Conditions");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select your Government ID image");
      return;
    }
    if (!selectedProfileFile) {
      toast.error("Please upload your profile picture");
      return;
    }
    if (formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    if (!validateAge(formData.dob)) {
      toast.error("You must be at least 18 years old to volunteer");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");

      // 1. Upload Profile Picture
      const profileData = new FormData();
      profileData.append("image", selectedProfileFile);
      const profileResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/volunteers/upload`,
        profileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const profileUrl = profileResponse.data.imageUrl;

      // 2. Upload Gov ID
      const govIdData = new FormData();
      govIdData.append("image", selectedFile);
      const govIdResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/volunteers/upload`,
        govIdData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const govIdUrl = govIdResponse.data.imageUrl;

      // 3. Submit full application
      await axios.post(
        `${import.meta.env.VITE_API_URL}/volunteers/apply`,
        { ...formData, govIdImage: govIdUrl, profilePicture: profileUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setVolunteerStatus("pending");
      setShowSuccessPopup(true);
      setFormData({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        interest: "",
        govIdType: "",
        govIdImage: "",
        profilePicture: "",
        bloodGroup: "",
        dob: "",
        joiningDate: "",
        termsAccepted: false,
      });
      setSelectedFile(null);
      setSelectedProfileFile(null);
      setGovIdPreview(null);
      setProfilePreview(null);
      setHasScrolledToBottom(false);
    } catch (error) {
      console.error("Upload error:", error);
      let msg = "Application failed";
      
      if (error.response?.status === 401) {
        msg = "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      const val = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: val }));
      return;
    }
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleScroll = (e) => {
    const element = e.target;
    if (
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight,
      ) < 5
    ) {
      setHasScrolledToBottom(true);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 border border-border bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed";

  const govIdOptions = [
    "Aadhar Card",
    "Voter ID",
    "PAN Card",
    "Passport",
    "Other",
  ];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="bg-white min-h-screen py-24" ref={containerRef}>
      <SEO
        title={t("volunteer.seo_title")}
        description={t("volunteer.seo_desc")}
      />

      <div className="max-w-none mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-animation="vol-title">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">
            {t("volunteer.title")}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            {t("volunteer.description")}
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">10+</h3>
              <p className="text-gray-500 font-medium">
                {t("volunteer.active_volunteers")}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-8 md:p-12 rounded-3xl border border-border shadow-xl"
          data-animation="vol-form"
        >
          {isCheckingStatus ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Checking application status...</p>
            </div>
          ) : volunteerStatus && volunteerStatus !== "rejected" ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FaInfoCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Application Already Submitted</h3>
              <div className="inline-block px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm bg-primary/10 text-primary border border-primary/20">
                Status: {volunteerStatus}
              </div>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                {volunteerStatus === "pending" && "Your application is currently under review by our team. We'll contact you soon."}
                {volunteerStatus === "active" && "Congratulations! You are an active volunteer. Thank you for your service to humanity."}
                {volunteerStatus === "banned" && "Your volunteer account has been suspended. Please contact the administrator for clarification."}
              </p>
              {volunteerStatus === "active" && (
                <Button onClick={() => window.location.href = '/'} className="w-full mt-4">Back to Home</Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-primary">
                  {t("volunteer.form_title")}
                </h3>
                <span className="bg-blood/10 text-blood text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blood/20 animate-pulse">
                  18+ Years Only
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1">
                    Full Name (as per Gov ID) *
                  </label>
                  <input
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={inputClasses}
                    disabled={isFieldDisabled("fullName")}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("volunteer.email")}
                    className={inputClasses}
                    disabled={isFieldDisabled("email")}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1">
                    Profile Picture *
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative group flex-shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "profile")}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label
                        htmlFor="profile-upload"
                        className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:bg-bg/50 overflow-hidden transition-all"
                      >
                        {profilePreview ? (
                          <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <FaCamera className="text-primary/40" />
                        )}
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-400">Please upload a clear portrait photo. Max 5MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">
                      Phone Number (10 digits) *
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">
                      Blood Group *
                    </label>
                    <select
                      required
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="">{t("volunteer.blood_group")}</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">
                      Gender *
                    </label>
                    <select
                      required
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">
                      {t("volunteer.dob")} (18+ only) *
                    </label>
                    <input
                      required
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      min="1900-01-01"
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">
                      {t("volunteer.joining_date")} *
                    </label>
                    <input
                      required
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      min="1900-01-01"
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">
                      Gov ID Type *
                    </label>
                    <select
                      required
                      name="govIdType"
                      value={formData.govIdType}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="">{t("volunteer.gov_id_type")}</option>
                      {govIdOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">
                      Upload Gov ID Image *
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="gov-id-upload"
                      />
                      <label
                        htmlFor="gov-id-upload"
                        className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${govIdPreview ? "border-primary bg-primary/5 h-32" : "border-border hover:border-primary/50 h-12"}`}
                      >
                        {govIdPreview ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img
                              src={govIdPreview}
                              alt="Preview"
                              className="h-full w-auto object-contain rounded shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <span className="text-white text-xs font-bold uppercase tracking-widest">
                                Change Image
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FaCamera className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">
                              Upload ID Image
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1">
                    Area of Interest *
                  </label>
                  <select
                    required
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="">{t("volunteer.interest_area")}</option>
                    <option value="Blood Donation">
                      {t("volunteer.interests.blood")}
                    </option>
                    <option value="Poor/Needy Support">
                      {t("volunteer.interests.needy")}
                    </option>
                    <option value="Animal Rescue">
                      {t("volunteer.interests.animal")}
                    </option>
                    <option value="Event Organizing">
                      {t("volunteer.interests.event")}
                    </option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-1 py-2">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-gray-600">
                    {t("volunteer.accept_terms")}{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-primary font-bold hover:underline"
                    >
                      {t("volunteer.terms_conditions")}
                    </button>
                  </label>
                </div>

                {renderSubmitButton(
                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full py-4 text-lg font-bold uppercase tracking-wider"
                  >
                    Submit Request
                  </Button>,
                )}
              </form>
            </>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#f0f9f1] rounded-3xl p-10 max-w-md w-full relative shadow-2xl border border-green-100 text-center animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-blood transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle size={40} />
            </div>
            <img
              src={hclogo}
              alt="HC Logo"
              className="w-16 h-16 mx-auto mb-4 object-contain"
            />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Thank you for your interest in serving humanity!
            </h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              We deeply appreciate your intent to help. Our team will review
              your application and contact you soon for the next steps.
            </p>
            <Button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full py-4 bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                {t("volunteer.terms_conditions")}
              </h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="p-8 overflow-y-auto text-gray-600 leading-relaxed space-y-6"
            >
              <div>
                <h4 className="text-xl font-black text-primary mb-4 border-b pb-2 italic">
                  Volunteer & Rides Terms and Conditions
                </h4>
                <p className="font-medium">
                  Thank you for choosing to volunteer and participate with
                  Humanity Calls Trust, Bikers Unity Calls (BUC_India), and
                  Unity For Humanity (UFH Riders).
                </p>
                <p>
                  We deeply appreciate your time, dedication, and commitment
                  toward building a responsible, safe, and united community.
                </p>
                <p>
                  These Terms and Conditions outline the expectations,
                  responsibilities, and rights of our volunteers and
                  participants. Every volunteer’s profile, activity, and
                  participation will be governed strictly under Government Rules
                  and Regulations to ensure legality, transparency, safety, and
                  organizational betterment.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  1. Volunteer Role
                </h5>
                <p>
                  Volunteers may be involved in event planning, coordination,
                  on-site support, promotions, logistics, awareness campaigns,
                  plantation drives, charity initiatives, or other social
                  activities. Duties will be assigned based on organizational
                  needs, event requirements, and the volunteer’s skills and
                  availability.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  2. Eligibility (18+ Years)
                </h5>
                <p>
                  Volunteers must be at least 18 years old. PUC and above
                  qualification is preferred. Accurate personal details must be
                  provided during registration. A valid ID proof is mandatory at
                  the time of registration or participation.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  3. Code of Conduct
                </h5>
                <p>
                  Volunteers and riders agree to act respectfully, responsibly,
                  and professionally with staff, fellow volunteers,
                  participants, and the public. Abide by all organizational,
                  event-specific, and governmental safety and behavioral
                  guidelines. Refrain from discrimination, harassment,
                  misconduct, stunts, or any prohibited activities. Strictly
                  avoid volunteering or riding under the influence of alcohol,
                  drugs, or any banned substances.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  4. Time Commitment
                </h5>
                <p>
                  Volunteers must arrive on time and fulfill assigned
                  responsibilities. Any absence or inability to complete duties
                  must be informed to the coordinator in advance.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  5. Confidentiality
                </h5>
                <p>
                  Volunteers may access sensitive or organizational information,
                  which must be kept strictly confidential. Unauthorized
                  disclosure of such information is prohibited.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  6. Health and Safety
                </h5>
                <p>
                  All participants must comply with Police, Traffic Department,
                  and Government Health & Safety Regulations. Riders must wear
                  mandatory riding gear at all times. Any accidents, injuries,
                  or unsafe conditions must be reported immediately to the event
                  supervisor. Participants assume personal responsibility for
                  medical expenses, injuries, or property loss, unless caused by
                  organizational negligence.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  7. Use of Image and Media
                </h5>
                <p>
                  By registering, volunteers and riders grant permission for
                  their name, profile, image, and likeness to be used in photos,
                  videos, or media for awareness, reporting, and promotion of
                  social causes.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  8. Prohibited Activities
                </h5>
                <p>
                  No stunts, reckless riding, or drinking and driving are
                  permitted. Any behavior that may cause distress, harm, or risk
                  to self, others, or the organization will result in immediate
                  termination of participation at the individual’s own cost.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  9. COVID-19 and Public Guidelines
                </h5>
                <p>
                  All participants must follow COVID-19 protocols and any
                  additional public safety regulations issued by Government
                  authorities.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  10. Liability
                </h5>
                <p>
                  Volunteers and riders understand that their participation is
                  voluntary and they are not employees of the organization.
                  Humanity Calls Trust, BUC_India, UFH Riders, or partner NGOs
                  are not liable for personal injuries, damages, or losses
                  during participation, except in cases of organizational
                  negligence.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  11. Registration Fee (For Volunteers)
                </h5>
                <p>
                  A refundable registration fee of ₹1000 applies for official
                  volunteer recognition. The fee will be refunded after 365 days
                  of successful service. Non-completion will result in the fee
                  being treated as a donation, utilized exclusively for charity
                  and social development.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  12. Termination
                </h5>
                <p>
                  The organization reserves the right to suspend or dismiss any
                  volunteer or rider whose actions are unlawful, unsafe, or
                  against organizational values. In such cases, the registration
                  fee (if applicable) will be considered a donation.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-lg mb-2">
                  13. Collaboration Clause
                </h5>
                <p>
                  These terms are accepted under Humanity Calls Trust, in
                  collaboration with Bikers Unity Calls (BUC_India), Unity For
                  Humanity Riders (UFH Riders), and other supporting
                  NGOs/organizations. All collaborations and activities will
                  align with Government Rules and Regulations to ensure lawful,
                  safe, and impactful operations.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button
                onClick={() => setShowTerms(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Close
              </button>
              <button
                disabled={!hasScrolledToBottom}
                onClick={() => {
                  setFormData({ ...formData, termsAccepted: true });
                  setShowTerms(false);
                }}
                className={`px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${hasScrolledToBottom ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-gray-300 cursor-not-allowed"}`}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withFormAuth(Volunteer);
