import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import hclogo from "../assets/humanitycallslogo.avif";
import axios from "axios";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        username,
        password,
      });

      if (response.data.user.role === "admin") {
        sessionStorage.setItem("adminToken", response.data.token);
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        setError("Unauthorized access");
        toast.error("Unauthorized access");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      toast.error(err.response?.data?.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-border">
        <div className="flex items-center justify-center mb-8">
          <img
            src={hclogo}
            width="50"
            height="50"
            style={{ width: 50, height: 50, objectFit: "contain" }}
            alt="Humanity Calls logo"
          />
          <span className="text-xl font-bold text-blood tracking-tight">
            Humanity Calls
          </span>
        </div>
        <h2 className="text-3xl font-bold text-center text-primary mb-8 uppercase tracking-tight">
          Admin Login
        </h2>

        {error && (
          <div className="bg-blood/10 border border-blood/20 text-blood px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-body uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-body uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 border border-border bg-bg/30 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-body/60 hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] uppercase tracking-widest mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
