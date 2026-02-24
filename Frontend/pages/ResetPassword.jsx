import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../components/Button";
import Modal from "../components/Modal";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", isError: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setModalContent({
        title: "Error",
        message: "Passwords do not match",
        isError: true
      });
      setShowModal(true);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
        password: formData.password,
      });
      setModalContent({
        title: "Success",
        message: response.data.message || "Password reset successful. You can now login with your new password.",
        isError: false
      });
      setShowModal(true);
    } catch (error) {
      setModalContent({
        title: "Error",
        message: error.response?.data?.message || "Something went wrong. Please try again later.",
        isError: true
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (!modalContent.isError && modalContent.title === "Success") {
      navigate("/become-a-member");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-blood">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-text-body mb-1">New Password</label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blood focus:border-blood sm:text-sm pr-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-blood transition-colors focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">Confirm New Password</label>
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blood focus:border-blood sm:text-sm"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="blood"
              isLoading={loading}
              className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={modalContent.title}
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {!modalContent.isError ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <p className={`text-lg font-medium ${modalContent.isError ? 'text-red-600' : 'text-gray-700'}`}>
              {modalContent.message}
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleModalClose}
              className="px-8 py-3 bg-blood text-white rounded-lg font-bold hover:bg-blood/90 transition-all transform hover:scale-105 shadow-lg"
            >
              {modalContent.isError ? "Try Again" : "Go to Login"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResetPassword;
