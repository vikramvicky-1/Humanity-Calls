import React from "react";
import { FaUserFriends, FaCheck, FaTimes, FaBan, FaEnvelope } from "react-icons/fa";

export const LOGO_URL = "https://res.cloudinary.com/daokrum7i/image/upload/v1768550123/favicon-32x32_kca2tb.png";

export const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 mb-1">{label}</p>
    <p className="font-bold text-text-body break-words">{value || 'N/A'}</p>
  </div>
);

export const DetailList = ({ label, items }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 mb-3">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items && items.length > 0 ? (
        items.map((item, i) => (
          <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg border border-primary/10 capitalize">
            {item}
          </span>
        ))
      ) : (
        <span className="text-xs text-text-body/40 italic">None selected</span>
      )}
    </div>
  </div>
);

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

export const IdModal = ({ isOpen, onClose, idImage }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-4 border-b border-border">
          <h3 className="text-xl font-bold text-primary">Government ID Verification</h3>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-xl transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-4 bg-[#111] overflow-auto flex justify-center items-center" style={{ maxHeight: '80vh' }}>
          {idImage ? (
            <img src={idImage} alt="Gov ID" className="max-w-full h-auto shadow-2xl rounded-lg" />
          ) : (
            <div className="py-32 text-white/20 font-bold uppercase tracking-widest">No ID image found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ViewMoreModal = ({ isOpen, onClose, vol }) => {
  if (!isOpen || !vol) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-primary px-10 py-8 text-white flex justify-between items-center bg-gradient-to-r from-primary to-blood">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white">
              {vol.profilePicture ? (
                <img src={vol.profilePicture} alt={vol.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/20 bg-bg">
                  <FaUserFriends size={32} />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight">{vol.fullName}</h3>
              <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
                Volunteer Profile Details
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-10 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Basic Information</h4>
                <DetailItem label="Volunteer ID" value={vol.volunteerId} />
                <DetailItem label="Email" value={vol.email} />
                <DetailItem label="Phone" value={vol.phone} />
                <DetailItem label="Emergency Contact" value={vol.emergencyContact} />
                <DetailItem label="Gender" value={vol.gender} />
                <DetailItem label="Date of Birth" value={vol.dob ? new Date(vol.dob).toLocaleDateString("en-GB") : "N/A"} />
                <DetailItem label="Age" value={calculateAge(vol.dob)} />
                <DetailItem label="Joining Date" value={vol.joiningDate ? new Date(vol.joiningDate).toLocaleDateString("en-GB") : "N/A"} />
                <DetailItem label="Status" value={vol.status} />
                <DetailItem label="Terms Accepted" value={vol.termsAccepted ? "Yes" : "No"} />
                <DetailItem label="Submitted At" value={vol.createdAt ? new Date(vol.createdAt).toLocaleString("en-GB") : "N/A"} />
              </div>
              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Profile & Contribution</h4>
                <DetailItem label="Current Occupation" value={vol.occupation === 'Other' ? vol.occupationDetail : vol.occupation} />
                <DetailItem label="How Can You Help Us?" value={vol.skills} />
                <DetailItem label="Area of Interest" value={vol.interest} />
              </div>
              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Verification Information</h4>
                <DetailItem label="Government ID" value={vol.govIdType} />
                <DetailItem label="Blood Group" value={vol.bloodGroup} />
                {vol.govIdImage ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-body/40 mb-2">
                      Government ID Image
                    </p>
                    <img
                      src={vol.govIdImage}
                      alt="Government ID"
                      className="w-full max-h-[220px] object-contain rounded-xl border border-border bg-white"
                    />
                  </div>
                ) : (
                  <DetailItem label="Government ID Image" value="N/A" />
                )}
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-6 bg-bg/50 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Engagement Preferences</h4>
                <DetailList label="Time Commitment" items={vol.timeCommitment} />
                <DetailList label="Preferred Working Mode" items={vol.workingMode} />
                <DetailList label="Role Preference" items={Array.isArray(vol.rolePreference) ? vol.rolePreference : [vol.rolePreference]} />
              </div>
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">Motivation / Interest</h4>
                <p className="text-sm font-bold text-text-body italic">"{vol.interest}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
