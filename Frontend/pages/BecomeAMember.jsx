import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import Button from "../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BecomeAMember = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
    isSubscribedForMail: true,
  });

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);

  const { user, login, signup } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get("redirect") || "/";

  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to focus previous input
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { email: formData.email });
      setOtpSent(true);
      toast.success("Verification code sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otpValues.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: otpString,
      });
      setOtpVerified(true);
      toast.success("Email verified successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        if (!formData.acceptTerms) {
          toast.error("Please accept the terms and conditions");
          setLoading(false);
          return;
        }
        await signup(formData);
        toast.success("Account created successfully!");
      }
      navigate(redirectPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-blood">
            {isLogin ? "Login to your account" : "Become a Member"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-body mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blood focus:border-blood sm:text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">Email address</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  name="email"
                  type="email"
                  required
                  disabled={!isLogin && otpSent}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blood focus:border-blood sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {!isLogin && !otpVerified && (
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    isLoading={otpLoading}
                    disabled={!formData.email || otpSent}
                    variant="outline"
                    className="whitespace-nowrap px-4 py-2"
                  >
                    {otpSent ? "Code Sent" : "Send OTP"}
                  </Button>
                )}
              </div>
            </div>

            {/* OTP Input UI */}
            {!isLogin && otpSent && !otpVerified && (
              <div className="mt-4 p-4 border border-border rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-text-body mb-3 text-center">
                  Enter exactly 6 digits sent to your email
                </label>
                <div className="flex justify-center gap-2 mb-4">
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:border-blood focus:ring-1 focus:ring-blood outline-none bg-white"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpValues(["", "", "", "", "", ""]);
                    }}
                    className="text-sm text-gray-500 hover:text-blood font-medium focus:outline-none transition-colors"
                  >
                    Change Email
                  </button>
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    isLoading={otpLoading}
                    variant="blood"
                    className="px-6"
                  >
                    Verify OTP
                  </Button>
                </div>
              </div>
            )}

            {(isLogin || !isLogin) && (
              <div className="relative">
                <label className="block text-sm font-medium text-text-body mb-1">Password</label>
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
            )}
          </div>

          {isLogin && (
            <div className="flex items-center justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-blood hover:underline font-medium"
              >
                Forgot your password?
              </a>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blood focus:ring-blood border-gray-300 rounded"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                <label className="ml-2 block text-sm text-text-body">
                  I accept the{" "}
                  <a href="/terms" className="text-blood hover:underline" target="_blank" rel="noopener noreferrer">
                    terms and conditions
                  </a>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  name="isSubscribedForMail"
                  type="checkbox"
                  className="h-4 w-4 text-blood focus:ring-blood border-gray-300 rounded"
                  checked={formData.isSubscribedForMail}
                  onChange={handleChange}
                />
                <label className="ml-2 block text-sm text-text-body">
                  Subscribe to newsletter & get updates on events
                </label>
              </div>
            </div>
          )}

          <div>
            {isLogin ? (
              <Button
                type="submit"
                variant="blood"
                isLoading={loading}
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg"
              >
                Sign in
              </Button>
            ) : (
              <Button
                type="submit"
                variant="blood"
                isLoading={loading}
                disabled={!otpVerified}
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Sign up
              </Button>
            )}
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blood hover:underline font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeAMember;
