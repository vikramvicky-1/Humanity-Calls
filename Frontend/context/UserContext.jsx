import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
        headers,
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      { withCredentials: true },
    );
    if (response.data.token) {
      sessionStorage.setItem("token", response.data.token);
    }
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (data) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data, {
      withCredentials: true,
    });
    if (response.data.token) {
      sessionStorage.setItem("token", response.data.token);
    }
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    sessionStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const token = sessionStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.put(`${API_URL}/auth/profile`, data, {
      withCredentials: true,
      headers,
    });
    setUser(response.data.user);
    return response.data;
  };

  return (
    <UserContext.Provider
      value={{ user, loading, login, signup, logout, checkAuth, updateProfile }}
    >
      {children}
    </UserContext.Provider>
  );
};
