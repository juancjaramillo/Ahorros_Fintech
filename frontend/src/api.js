// src/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
});

// Adjunta SIEMPRE el token si existe en localStorage
api.interceptors.request.use((config) => {
  try {
    const t = localStorage.getItem("token");
    if (t) config.headers.Authorization = `Bearer ${t}`;
  } catch {}
  return config;
});

export default api;
