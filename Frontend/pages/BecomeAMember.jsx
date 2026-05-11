import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaUserAlt, FaArrowRight, FaEnvelope, FaLock, FaChevronLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    const mode = new URLSearchParams(location.search).get("mode");
    if (mode === "signup") {
      setIsLogin(false);
    } else if (mode === "login") {
      setIsLogin(true);
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
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
    <div className="min-h-screen bg-[#FCF8F8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blood/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-black/5 relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <Link to="/" className="group flex items-center gap-2 mb-6 bg-black/3 px-3.5 py-1.5 rounded-full hover:bg-black/5 transition-colors">
              <FaChevronLeft className="text-[9px] text-black/40 group-hover:text-blood transition-colors" />
              <span className="text-[10px] font-black tracking-widest text-black/40 uppercase group-hover:text-blood transition-colors" style={{ fontFamily: '"Syne", sans-serif' }}>Home</span>
            </Link>
            
            <h2 className="text-4xl font-black text-black tracking-tighter text-center leading-tight mb-3" style={{ fontFamily: '"Syne", sans-serif' }}>
              {isLogin ? "Welcome Back." : "Join the Mission."}
            </h2>
            <p className="text-black/30 font-bold text-sm text-center max-w-[280px]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {isLogin ? "Continue your journey with us." : "Create your account to get started."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-1.5 ml-3">Full Name</label>
                  <div className="relative">
                    <FaUserAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-black/10 text-xs" />
                    <input
                      name="name"
                      type="text"
                      required={!isLogin}
                      className="w-full bg-black/2 border border-black/5 rounded-2xl px-12 py-3.5 text-xs font-bold placeholder:text-black/20 focus:ring-2 focus:ring-purple-500/10 transition-all outline-none"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-1.5 ml-3">Email</label>
                <div className="relative grow">
                  <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-black/10 text-xs" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-black/2 border border-black/5 rounded-2xl px-12 py-3.5 text-xs font-bold placeholder:text-black/20 focus:ring-2 focus:ring-purple-500/10 transition-all outline-none"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isLogin && otpSent}
                  />
                </div>
              </div>

              {!isLogin && !otpVerified && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                        otpLoading || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                          ? "bg-black/5 text-black/20 cursor-not-allowed"
                          : "bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white shadow-purple-600/10"
                      }`}
                    >
                      {otpLoading ? (
                        "Sending Code..."
                      ) : (
                        <>
                          Send Verification Code
                          <FaArrowRight className="text-[10px]" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between gap-2">
                        {otpValues.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-full h-12 text-center bg-black/2 border border-black/5 rounded-xl text-lg font-black focus:ring-2 focus:ring-purple-500/10 transition-all outline-none"
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpLoading}
                        className="w-full py-3.5 rounded-2xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                      >
                        {otpLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-1.5 ml-3">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-black/10 text-xs" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full bg-black/2 border border-black/5 rounded-2xl px-12 py-3.5 text-xs font-bold placeholder:text-black/20 focus:ring-2 focus:ring-purple-500/10 transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-start gap-3 px-2 py-2">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-black/10 text-purple-600 focus:ring-purple-500/20"
                  />
                  <label htmlFor="acceptTerms" className="text-[10px] font-bold text-black/40 leading-relaxed">
                    I agree to the <Link to="/terms" className="text-blood hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-blood hover:underline">Privacy Policy</Link>.
                  </label>
                </div>
              )}
            </div>

            {isLogin && (
              <div className="flex justify-end pr-2">
                <Link
                  to="/forgot-password"
                  className="relative text-[9px] font-black uppercase tracking-widest text-black/50 hover:text-purple-600 transition-colors group/forgot"
                >
                  Forgot password?
                  <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-purple-600/40 rounded-full scale-x-0 group-hover/forgot:scale-x-100 transition-transform origin-left" />
                </Link>
              </div>
            )}

            <div className="pt-2">
              <motion.button
                type="submit"
                initial="initial"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                disabled={loading || (!isLogin && !otpVerified)}
                className={`relative w-full ${(!isLogin && !otpVerified) ? 'bg-black/10 cursor-not-allowed' : 'bg-[#1a1a1a]'} text-white py-5 rounded-3xl shadow-xl shadow-black/5 overflow-hidden group/main transition-colors`}
              >
                {!(!isLogin && !otpVerified) && (
                  <motion.div 
                    variants={{
                      initial: { scaleX: 0, opacity: 0 },
                      hover: { scaleX: 1, opacity: 1 },
                    }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    className="absolute inset-0 bg-purple-600 z-0 origin-center"
                  />
                )}
                
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                  <span className="text-[11px] font-black uppercase tracking-widest" style={{ fontFamily: '"Syne", sans-serif' }}>
                    {loading ? "Please Wait..." : isLogin ? "Login Now" : "Create Account"}
                  </span>
                  <motion.div
                    variants={{
                      initial: { x: 0 },
                      hover: { x: 5 }
                    }}
                    transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <FaArrowRight className="text-sm" />
                  </motion.div>
                </div>
              </motion.button>
            </div>
          </form>

          <div className="mt-10 flex flex-col gap-6">
            <button
              type="button"
              onClick={() => {
                const newMode = !isLogin ? "login" : "signup";
                const searchParams = new URLSearchParams(location.search);
                searchParams.set("mode", newMode);
                setIsLogin(!isLogin);
                navigate(`/become-a-member?${searchParams.toString()}`);
              }}
              className="group flex flex-col items-center gap-1.5 w-full"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 group-hover:text-black/40 transition-colors">
                {isLogin ? "Need an account?" : "Already have an account?"}
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-600 group-hover:text-purple-700 transition-colors" style={{ fontFamily: '"Syne", sans-serif' }}>
                {isLogin ? "Create Your Account →" : "Sign In to Your Account →"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BecomeAMember;
