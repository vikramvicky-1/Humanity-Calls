import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "./apiConfig.js";

const errorToast = (message) =>
  toast.error(message || "Something went wrong. Please try again.", {
    style: {
      backgroundColor: "#1A1A1A",
      color: "#fff",
      borderLeft: "5px solid #B71C1C",
    },
  });

/** Public image upload (JPEG/PNG/WebP, etc.) — do not set Content-Type manually (browser sets boundary). */
export const uploadPublicImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axios.post(`${API_URL}/public/upload-image`, formData, {
    withCredentials: true,
  });
  return response.data?.imageUrl;
};

/** Image or PDF proof (e.g. emergency donation) — max 8MB server-side. */
export const uploadPublicProofFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_URL}/public/upload-proof`, formData, {
    withCredentials: true,
  });
  return response.data?.imageUrl;
};

export const submitPublicBloodDonation = async (data) => {
  try {
    await axios.post(`${API_URL}/public/blood-donation`, { data });
    toast.success("Blood donation pledge submitted successfully!", {
      style: {
        backgroundColor: "#1A1A1A",
        color: "#fff",
        borderLeft: "5px solid #4CAF50",
      },
    });
    return true;
  } catch (error) {
    if (error.response?.status === 429) {
      errorToast("Too many attempts. Please try again shortly.");
    } else {
      errorToast(error.response?.data?.message);
    }
    return false;
  }
};
