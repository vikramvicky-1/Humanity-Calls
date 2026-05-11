import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaCamera, FaIdCard, FaUserFriends, FaCheck } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthToken } from "../../utils/authToken.js";
import hclogo from "../../assets/humanitycallslogo.avif";

export const LOGO_URL = hclogo;

export const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const DetailItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">{label}</p>
    <p className="font-bold text-text-body text-sm">{value || "N/A"}</p>
  </div>
);

const DetailList = ({ label, items }) => {
  const displayItems = Array.isArray(items) ? items : (items ? [items] : []);
  
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">{label}</p>
      <div className="flex flex-wrap gap-2">
        {displayItems.length > 0 ? (
          displayItems.map((item, i) => (
            <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-full border border-primary/10">
              {item}
            </span>
          ))
        ) : (
          <span className="text-text-body/30 text-[10px] font-bold">N/A</span>
        )}
      </div>
    </div>
  );
};

export const IdModal = ({ isOpen, onClose, imageUrl }) => {
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>
        <img src={imageUrl} alt="ID" className="w-full h-auto max-h-[85vh] object-contain mx-auto" />
      </div>
    </div>,
    document.body
  );
};

export const ViewMoreModal = ({ isOpen, onClose, vol }) => {
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      if (window.__lenis) window.__lenis.start();
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      if (window.__lenis) window.__lenis.start();
    };
  }, [isOpen]);

  if (!isOpen || !vol) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-500 h-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="bg-primary p-8 text-white flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
              {vol.profilePicture ? (
                <img src={vol.profilePicture} alt={vol.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                  <FaUserFriends size={40} />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight">{vol.fullName}</h3>
              <p className="text-white/70 font-bold uppercase tracking-widest text-xs mt-1">
                Volunteer Profile Details
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="relative z-20 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          className="p-10 overflow-y-auto flex-grow min-h-0 custom-scrollbar bg-white"
          style={{ overscrollBehavior: 'contain' }}
          data-lenis-prevent
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Contact Information</h4>
                <DetailItem label="Email Address" value={vol.email} />
                <DetailItem label="Phone Number" value={vol.phone} />
                <DetailItem label="Emergency Contact" value={vol.emergencyContact} />
                <DetailItem label="Location" value={vol.locationAddress} />
              </div>

              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Personal Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Date of Birth" value={vol.dob ? new Date(vol.dob).toLocaleDateString("en-GB") : "N/A"} />
                  <DetailItem label="Age" value={calculateAge(vol.dob)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Gender" value={vol.gender} />
                  <DetailItem label="Blood Group" value={vol.bloodGroup} />
                </div>
                <DetailItem label="Joining Date" value={vol.joiningDate ? new Date(vol.joiningDate).toLocaleDateString("en-GB") : "N/A"} />
              </div>

              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Verification Information</h4>
                <DetailItem label="Government ID" value={vol.govIdType} />
                <DetailItem
                  label="Driving license"
                  value={
                    vol.hasDrivingLicense
                      ? vol.drivingLicenseImageUrl
                        ? "Yes — open Documents from admin list to view upload"
                        : "Declared yes — document missing"
                      : "No"
                  }
                />
                {vol.referrer && (
                  <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600/60 mb-1">Referred By</p>
                    <p className="font-bold text-green-700">{vol.referrer.fullName} ({vol.referrer.volunteerId})</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Experience & Skills</h4>
                <DetailItem label="Current Occupation" value={vol.occupation === 'Other' ? vol.occupationDetail : vol.occupation} />
                <DetailItem label="Professional Skills" value={vol.skills} />
                <div className="mt-4">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Motivation / Interest</h4>
                  <p className="text-sm font-bold text-text-body italic">"{vol.interest}"</p>
                </div>
              </div>
              
              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Engagement Preferences</h4>
                <DetailList label="Time Commitment" items={vol.timeCommitment} />
                <DetailList label="Preferred Working Mode" items={vol.workingMode} />
                <DetailList label="Role Preferences" items={vol.rolePreference} />
                <DetailList label="Donation Support" items={vol.deviceDonationChoices} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const VolunteerEditModal = ({ isOpen, onClose, volunteer, onUpdate }) => {
  const [formData, setFormData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Crop states
  const [cropImage, setCropImage] = useState(null);
  const [cropType, setCropType] = useState(null); // 'profile' or 'govId'

  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      if (window.__lenis) window.__lenis.start();
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      if (window.__lenis) window.__lenis.start();
    };
  }, [isOpen]);

  useEffect(() => {
    if (volunteer) {
      setFormData({ ...volunteer });
    }
  }, [volunteer]);

  if (!isOpen || !formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'dl') {
        setFormData(prev => ({ ...prev, drivingLicenseImageUrl: reader.result }));
      } else {
        setCropImage(reader.result);
        setCropType(type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const token = sessionStorage.getItem("adminToken") || getAuthToken();
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/volunteers/${formData._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(res.data.volunteer);
      toast.success("Volunteer updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const occupations = ["Student", "Professional", "Business", "Home Maker", "Retired", "Other"];
  const interests = ["Education", "Healthcare", "Environment", "Animal Welfare", "Social Service", "Disaster Relief"];
  const govIdOptions = ["Aadhar Card", "Voter ID", "PAN Card", "Passport", "Other"];

  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1";
  const inputClasses = "w-full px-4 py-3 bg-bg/50 border border-primary/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-sm text-text-body";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500 h-full max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-primary/5 flex items-center justify-between bg-primary/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FaIdCard size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-primary">Edit Volunteer Profile</h3>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Update detailed information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-bg rounded-2xl shadow-sm transition-all text-primary/40 hover:text-primary">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div 
          className="p-10 overflow-y-auto flex-grow min-h-0 custom-scrollbar bg-white"
          style={{ overscrollBehavior: 'contain' }}
          data-lenis-prevent
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Core Information</h4>
                <div className="space-y-1">
                  <label className={labelClasses}>Full Name</label>
                  <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} className={inputClasses} />
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Phone Number</label>
                  <input name="phone" type="text" value={formData.phone} onChange={handleChange} className={inputClasses} />
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={inputClasses}>
                    <option value="">Select BG</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Area of Interest</label>
                  <select name="interest" value={formData.interest} onChange={handleChange} className={inputClasses}>
                    <option value="">Select Interest</option>
                    {interests.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Occupation</label>
                  <select name="occupation" value={formData.occupation} onChange={handleChange} className={inputClasses}>
                    <option value="">Select Occupation</option>
                    {occupations.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {formData.occupation === 'Other' && (
                  <div className="space-y-1">
                    <label className={labelClasses}>Specify Occupation</label>
                    <input name="occupationDetail" type="text" value={formData.occupationDetail} onChange={handleChange} className={inputClasses} />
                  </div>
                )}
                <div className="space-y-1">
                  <label className={labelClasses}>Government ID Type</label>
                  <select name="govIdType" value={formData.govIdType} onChange={handleChange} className={inputClasses}>
                    {govIdOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-4 pt-4 border-t border-primary/5">
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Engagement Preferences</h4>
                  <div className="space-y-1">
                    <label className={labelClasses}>Time Commitment</label>
                    <select name="timeCommitment" value={formData.timeCommitment} onChange={handleChange} className={inputClasses}>
                      <option value="">Select Commitment</option>
                      {["One-time Event", "Weekend Volunteer", "Monthly Commitment", "Project-Based", "Long-Term Association"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>Working Mode</label>
                    <select name="workingMode" value={formData.workingMode} onChange={handleChange} className={inputClasses}>
                      <option value="">Select Mode</option>
                      {["On-ground (Field Work)", "Remote / Online", "Hybrid"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>Role Preference</label>
                    <select name="rolePreference" value={formData.rolePreference} onChange={handleChange} className={inputClasses}>
                      <option value="">Select Role</option>
                      {["Team Member", "Team Leader", "Coordinator", "Consultant / Advisor", "Intern"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                {formData.referrer && (
                  <div className="space-y-1 pt-4">
                    <label className={labelClasses}>Referred By (Read Only)</label>
                    <input readOnly type="text" value={`${formData.referrer.fullName} (${formData.referrer.volunteerId})`} className={`${inputClasses} bg-green-50 text-green-700 font-bold cursor-not-allowed border-green-200`} />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className={labelClasses}>Skills</label>
                  <textarea name="skills" rows="3" value={formData.skills} onChange={handleChange} className={`${inputClasses} resize-none`} />
                </div>
                
                <div className="space-y-1">
                  <label className={labelClasses}>Location Address</label>
                  <textarea name="locationAddress" rows="2" value={formData.locationAddress} onChange={handleChange} className={`${inputClasses} resize-none`} />
                </div>

                <div className="p-6 bg-bg/50 rounded-3xl border border-primary/5 space-y-4">
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Driving Status</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="hasDrivingLicense" checked={formData.hasDrivingLicense === true} onChange={() => setFormData(p => ({ ...p, hasDrivingLicense: true }))} className="accent-primary" />
                      <span className="text-xs font-bold">Has License</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="hasDrivingLicense" checked={formData.hasDrivingLicense === false} onChange={() => setFormData(p => ({ ...p, hasDrivingLicense: false }))} className="accent-primary" />
                      <span className="text-xs font-bold">No License</span>
                    </label>
                  </div>
                  {formData.hasDrivingLicense && (
                    <div className="space-y-2">
                      <label className={labelClasses}>License Image</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border border-primary/10 overflow-hidden bg-white">
                          {formData.drivingLicenseImageUrl ? <img src={formData.drivingLicenseImageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary/10"><FaCamera /></div>}
                        </div>
                        <label className="px-4 py-2 bg-white border border-primary/10 rounded-lg text-[10px] font-black cursor-pointer hover:bg-primary hover:text-white transition-all">
                          Update DL
                          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'dl')} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-bg/50 rounded-[2.5rem] space-y-6 border border-primary/5">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Profile Images</h4>
                
                <div className="space-y-4">
                  <label className={labelClasses}>Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/10 shadow-inner">
                      {formData.profilePicture ? (
                        <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white"><FaCamera className="text-primary/10" size={32} /></div>
                      )}
                    </div>
                    <label className="px-6 py-3 bg-white border border-primary/10 text-primary text-xs font-black rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
                      Change Photo
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'profile')} accept="image/*" />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={labelClasses}>Government ID Photo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/10 shadow-inner">
                      {formData.govIdImage ? (
                        <img src={formData.govIdImage} alt="ID" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white"><FaIdCard className="text-primary/10" size={32} /></div>
                      )}
                    </div>
                    <label className="px-6 py-3 bg-white border border-primary/10 text-primary text-xs font-black rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
                      Replace ID
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'govId')} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-primary/5 border-t border-primary/5 flex items-center justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-4 text-primary/40 hover:text-primary font-black text-xs uppercase tracking-widest transition-all">
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={isUpdating} className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {isUpdating ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
