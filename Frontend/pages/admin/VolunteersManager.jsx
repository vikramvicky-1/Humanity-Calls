import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  FaUserFriends, FaSearch, FaDownload, 
  FaEye, FaEdit, FaBan, FaTrash, FaCheck, FaTimes 
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  calculateAge, IdModal, ViewMoreModal 
} from "./AdminComponents";
import { useOutletContext } from "react-router-dom";

const VolunteersManager = () => {
  const { onStatusUpdate } = useOutletContext();
  const [volunteers, setVolunteers] = useState([]);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);
  const [volunteerStatusTab, setVolunteerStatusTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedIdImage, setSelectedIdImage] = useState("");
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [selectedVolunteerDetails, setSelectedVolunteerDetails] = useState(null);
  
  const [showVolunteerEditModal, setShowVolunteerEditModal] = useState(false);
  const [volunteerToEdit, setVolunteerToEdit] = useState(null);
  const [isUpdatingVolunteer, setIsUpdatingVolunteer] = useState(false);
  
  const [showUpdateStatusPopup, setShowUpdateStatusPopup] = useState(false);
  const [updateStatusTarget, setUpdateStatusTarget] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const volunteerTabs = ["active", "temporary", "banned", "rejected"];

  useEffect(() => {
    fetchVolunteers();
  }, [volunteerStatusTab]);

  const fetchVolunteers = async () => {
    setIsLoadingVolunteers(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const url = `${import.meta.env.VITE_API_URL}/volunteers?status=${volunteerStatusTab}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVolunteers(response.data);
    } catch (err) {
      toast.error("Failed to fetch volunteers");
    } finally {
      setIsLoadingVolunteers(false);
    }
  };

  const handleVolunteerUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingVolunteer(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/volunteers/${volunteerToEdit._id}`,
        volunteerToEdit,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Volunteer details updated");
      setShowVolunteerEditModal(false);
      fetchVolunteers();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsUpdatingVolunteer(false);
    }
  };

  const handleUpdateLevel = async (id, status, isTemporary = false) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/volunteers/status/${id}`,
        { status, isTemporary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status updated successfully");
      fetchVolunteers();
      if (onStatusUpdate) onStatusUpdate();
      setShowUpdateStatusPopup(false);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleDeleteVolunteer = async () => {
    if (!volunteerToDelete) return;
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/volunteers/${volunteerToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Volunteer removed");
      setShowDeleteModal(false);
      fetchVolunteers();
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      vol.fullName?.toLowerCase().includes(q) ||
      vol.email?.toLowerCase().includes(q) ||
      vol.volunteerId?.toLowerCase().includes(q)
    );
  });

  const handleExportExcel = () => {
    const data = filteredVolunteers.map(v => ({ ID: v.volunteerId, Name: v.fullName, Email: v.email, Status: v.status }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Volunteers");
    XLSX.writeFile(wb, `Volunteers_${volunteerStatusTab}_${new Date().toLocaleDateString()}.xlsx`);
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Volunteers Report - ${volunteerStatusTab}`, 14, 15);
    const rows = filteredVolunteers.map(v => [v.volunteerId, v.fullName, v.email, v.status]);
    autoTable(doc, { head: [["ID", "Name", "Email", "Status"]], body: rows, startY: 20 });
    doc.save(`Volunteers_${volunteerStatusTab}_${new Date().toLocaleDateString()}.pdf`);
    setShowExportModal(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
          <FaUserFriends /> Volunteers
        </h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body/40" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full text-sm"
            />
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            disabled={filteredVolunteers.length === 0}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg text-sm disabled:opacity-50"
          >
            <FaDownload /> Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 bg-bg p-1.5 rounded-2xl w-fit">
        {volunteerTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setVolunteerStatusTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold transition-all capitalize flex items-center gap-2 text-sm ${
              volunteerStatusTab === tab
                ? tab === "temporary" ? "bg-amber-500 text-white shadow-md" : "bg-primary text-white shadow-md"
                : "text-text-body/60 hover:text-primary hover:bg-white"
            }`}
          >
            {tab === "active" && <FaCheck size={12} />}
            {tab === "temporary" && <span className="text-[10px]">⏳</span>}
            {tab === "banned" && <FaBan size={12} />}
            {tab === "rejected" && <FaTimes size={12} />}
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full overflow-hidden">
        {isLoadingVolunteers ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-body/60 font-medium italic">Loading volunteers...</p>
          </div>
        ) : filteredVolunteers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-body/40 text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-4 py-4 text-center">Profile</th>
                  <th className="px-4 py-4">Volunteer Info</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Gender</th>
                  <th className="px-4 py-4">Details</th>
                  <th className="px-4 py-4">Gov ID</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredVolunteers.map((vol) => (
                  <tr key={vol._id} className="hover:bg-bg/50 transition-colors group">
                    <td className="px-4 py-4 text-center">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 mx-auto shadow-inner">
                        {vol.profilePicture ? (
                          <img src={vol.profilePicture} alt={vol.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/20 bg-bg">
                            <FaUserFriends size={28} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-bold text-text-body text-base">{vol.fullName}</div>
                      {vol.volunteerId && (
                        <div className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black tracking-widest mt-1 w-fit">
                          {vol.volunteerId}
                        </div>
                      )}
                      <div className="text-[11px] text-text-body/40 font-medium">
                        DOB: {vol.dob ? `${new Date(vol.dob).toLocaleDateString("en-GB")} (${calculateAge(vol.dob)}Y)` : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-text-body/80">{vol.email}</div>
                      <div className="text-[11px] text-text-body/40 font-bold">{vol.phone}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-text-body/70 uppercase text-xs">
                      {vol.gender || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold">BG: <span className="text-blood">{vol.bloodGroup}</span></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => { setSelectedIdImage(vol.govIdImage); setShowIdModal(true); }}
                        className="flex items-center gap-2 text-primary hover:underline text-[10px] font-bold"
                      >
                        <FaEye /> {vol.govIdType}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2 items-center">
                        <button
                          onClick={() => { setSelectedVolunteerDetails(vol); setShowViewMoreModal(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View full details"
                        >
                          <FaEye size={14} />
                        </button>
                        {vol.status !== "rejected" && (
                          <button
                            onClick={() => { setVolunteerToEdit({ ...vol }); setShowVolunteerEditModal(true); }}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <FaEdit size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => { setUpdateStatusTarget(vol); setShowUpdateStatusPopup(true); }}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-[11px] hover:bg-primary/20 transition-all whitespace-nowrap"
                        >
                          ⚙ Status
                        </button>
                        <button
                          onClick={() => { setVolunteerToDelete(vol); setShowDeleteModal(true); }}
                          className="p-1.5 text-blood hover:bg-blood/10 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <FaUserFriends size={64} className="mx-auto text-primary/10 mb-6" />
            <h3 className="text-2xl font-bold text-text-body mb-2">No {volunteerStatusTab} volunteers found</h3>
          </div>
        )}
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-primary mb-6">Dispatch Report</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleExportExcel}
                className="flex flex-col items-center gap-3 p-6 bg-green-50 rounded-2xl border-2 border-green-100 hover:border-green-500 hover:bg-green-100 transition-all"
              >
                <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-200"><FaDownload /></div>
                <span className="font-bold text-green-700">Excel (XLSX)</span>
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex flex-col items-center gap-3 p-6 bg-red-50 rounded-2xl border-2 border-red-100 hover:border-red-500 hover:bg-red-100 transition-all"
              >
                <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-200"><FaDownload /></div>
                <span className="font-bold text-red-700">Acrobat (PDF)</span>
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-8 text-sm font-bold text-text-body/40 hover:text-primary transition-colors"
            >
              Discard Export
            </button>
          </div>
        </div>
      )}

      <IdModal isOpen={showIdModal} onClose={() => setShowIdModal(false)} idImage={selectedIdImage} />
      <ViewMoreModal isOpen={showViewMoreModal} onClose={() => setShowViewMoreModal(false)} vol={selectedVolunteerDetails} />

      {/* Edit Modal */}
      {showVolunteerEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary px-8 py-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-widest">Edit Volunteer Profile</h3>
              <button onClick={() => setShowVolunteerEditModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><FaTimes size={20} /></button>
            </div>
            <form onSubmit={handleVolunteerUpdate} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Full Name</label>
                  <input required type="text" value={volunteerToEdit.fullName} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, fullName: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Email (Read Only)</label>
                  <input readOnly type="email" value={volunteerToEdit.email} className="w-full px-5 py-3 border border-border rounded-xl bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Phone</label>
                  <input required type="text" value={volunteerToEdit.phone} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, phone: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Date of Birth</label>
                  <input required type="date" value={volunteerToEdit.dob ? new Date(volunteerToEdit.dob).toISOString().split('T')[0] : ''} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, dob: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Gender</label>
                  <select value={volunteerToEdit.gender} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, gender: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none appearance-none">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Blood Group</label>
                  <select value={volunteerToEdit.bloodGroup} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, bloodGroup: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none appearance-none">
                    <option value="">Select BG</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Occupation</label>
                  <select value={volunteerToEdit.occupation} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, occupation: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none appearance-none">
                    <option value="">Select Occupation</option>
                    {["Student", "Professional", "Business", "Self-Employed", "Retired", "Other"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {volunteerToEdit.occupation === 'Other' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Specify Occupation</label>
                    <input type="text" value={volunteerToEdit.occupationDetail} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, occupationDetail: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Skills</label>
                <textarea rows="2" value={volunteerToEdit.skills} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, skills: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-body/40">Motivation/Interest</label>
                <textarea rows="2" value={volunteerToEdit.interest} onChange={(e) => setVolunteerToEdit({ ...volunteerToEdit, interest: e.target.value })} className="w-full px-5 py-3 border border-border rounded-xl focus:border-primary outline-none resize-none" />
              </div>
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowVolunteerEditModal(false)} className="flex-1 py-4 border border-border rounded-2xl font-bold hover:bg-bg transition-all text-sm">Cancel</button>
                <button type="submit" disabled={isUpdatingVolunteer} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all text-sm">
                  {isUpdatingVolunteer ? "Syncing..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateStatusPopup && updateStatusTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 text-center p-10">
            <h3 className="text-2xl font-black text-primary mb-6">Modify Standing</h3>
            <div className="grid grid-cols-1 gap-4">
              {["active", "temporary", "banned", "rejected"].map(s => (
                s !== updateStatusTarget.status && (
                  <button
                    key={s}
                    onClick={() => handleUpdateLevel(updateStatusTarget._id, s, s === "temporary")}
                    className="p-5 border-2 border-border rounded-2xl font-bold capitalize hover:border-primary hover:bg-primary/5 transition-all text-sm"
                  >
                    Move to {s}
                  </button>
                )
              ))}
            </div>
            <button onClick={() => setShowUpdateStatusPopup(false)} className="mt-8 text-xs font-bold text-text-body/40">Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-xl w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-primary mb-2 tracking-tight">Erase record?</h3>
            <p className="text-sm font-bold text-text-body/60 mb-8">This will delete <strong>{volunteerToDelete?.fullName}</strong> permanently.</p>
            <div className="flex gap-4">
              <button disabled={isDeleting} onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-bg rounded-2xl font-bold">Cancel</button>
              <button disabled={isDeleting} onClick={handleDeleteVolunteer} className="flex-1 py-4 bg-blood text-white rounded-2xl font-black shadow-lg">
                {isDeleting ? "Deleting..." : "Erase Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteersManager;
