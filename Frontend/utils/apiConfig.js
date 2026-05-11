/** Same default as UserContext — avoids requests to "undefined/..." when env is missing. */
export const API_URL =
  (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
  "http://localhost:5000/api";
