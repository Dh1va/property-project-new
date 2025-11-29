// src/services/api.js
import axios from "axios";
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

// optional: attach token if using AuthContext that stores token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or get from AuthContext
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
