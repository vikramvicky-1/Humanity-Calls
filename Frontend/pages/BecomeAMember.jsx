import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../components/Button";

const BecomeAMember = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  });
  const { user, login, signup } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      navigate("/");
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
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blood focus:border-blood sm:text-sm"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
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
            <div className="flex items-center">
              <input
                name="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-blood focus:ring-blood border-gray-300 rounded"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <label className="ml-2 block text-sm text-text-body">
                I accept the{" "}
                <a href="/terms" className="text-blood hover:underline">
                  terms and conditions
                </a>
              </label>
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="blood"
              isLoading={loading}
              className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg"
            >
              {isLogin ? "Sign in" : "Sign up"}
            </Button>
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
