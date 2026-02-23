import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaIdCard, FaArrowLeft } from "react-icons/fa";

const Verify = () => {
  const { volunteerId } = useParams();
  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/id-card/verify/${volunteerId}`
        );
        setVolunteer(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Volunteer not found");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [volunteerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors group"
        >
          <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {error ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-red-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-red-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Volunteer Not Found</h2>
            <p className="text-gray-500 mb-8">
              The volunteer ID you are looking for is invalid or does not exist in our records.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Go Home
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className={`h-32 relative ${volunteer.verified ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-lg">
                  {volunteer.profilePicture ? (
                    <img 
                      src={volunteer.profilePicture} 
                      alt={volunteer.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <FaUser className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-20 pb-10 px-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{volunteer.fullName}</h1>
                {volunteer.verified && (
                  <FaCheckCircle className="text-blue-500 text-xl" title="Verified Volunteer" />
                )}
              </div>
              <p className="text-primary font-semibold mb-6">Humanity Calls Volunteer</p>

              <div className="grid grid-cols-1 gap-4 text-left max-w-xs mx-auto mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
                    <FaIdCard />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Volunteer ID</p>
                    <p className="text-gray-800 font-semibold">{volunteer.volunteerId}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Member Since</p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(volunteer.memberSince).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
                    <div className={`w-2 h-2 rounded-full ${volunteer.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Status</p>
                    <p className={`font-semibold capitalize ${volunteer.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                      {volunteer.status}
                    </p>
                  </div>
                </div>
              </div>

              {volunteer.verified ? (
                <div className="bg-green-50 text-green-700 py-3 px-6 rounded-2xl inline-flex items-center gap-2 font-medium">
                  <FaCheckCircle />
                  Verified Active Member
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-700 py-3 px-6 rounded-2xl inline-flex items-center gap-2 font-medium">
                  <FaTimesCircle />
                  Status: {volunteer.status}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
