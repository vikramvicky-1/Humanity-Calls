import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getAuthToken, setAuthToken } from "../utils/authToken.js";
import { API_URL } from "../utils/apiConfig.js";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
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
      setAuthToken(null);
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
      setAuthToken(response.data.token);
    }
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (data) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data, {
      withCredentials: true,
    });
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    setAuthToken(null);
    setUser(null);
    
    // Clear all pending form data from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("pending_form_")) {
        localStorage.removeItem(key);
      }
    });
  };

  const updateProfile = async (data) => {
    const token = getAuthToken();
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

  const verifyProfileEmail = async (otp) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_URL}/auth/verify-profile-email`, { otp }, {
      withCredentials: true,
      headers,
    });
    setUser(response.data.user);
    return response.data;
  };

  return (
    <UserContext.Provider
      value={{ user, loading, login, signup, logout, checkAuth, updateProfile, verifyProfileEmail }}
    >
      {children}
    </UserContext.Provider>
  );
};
