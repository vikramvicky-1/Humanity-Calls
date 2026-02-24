import React, { useState } from "react";
import axios from "axios";
import Button from "../components/Button";
import Modal from "../components/Modal";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      setModalContent({
        title: "Success",
        message: response.data.message || "Reset link sent to your email. Please check your inbox.",
        isError: false
      });
      setShowModal(true);
      setEmail("");
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-blood">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blood focus:border-blood sm:text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              Send Reset Link
            </Button>
          </div>
        </form>
        <div className="text-center">
          <a
            href="/become-a-member"
            className="text-sm text-blood hover:underline font-medium"
          >
            Back to Login
          </a>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
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
              onClick={() => setShowModal(false)}
              className="px-8 py-3 bg-blood text-white rounded-lg font-bold hover:bg-blood/90 transition-all transform hover:scale-105 shadow-lg"
            >
              Okay, Got it
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
