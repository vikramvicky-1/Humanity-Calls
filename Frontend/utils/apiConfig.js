/** Same default as UserContext — avoids requests to "undefined/..." when env is missing. */
const rawUrl = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) || "http://localhost:5000/api";
export const API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
