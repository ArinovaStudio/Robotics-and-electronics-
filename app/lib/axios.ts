import axios from "axios";
import { useAdminStore } from "@/store/adminStore";

const api = axios.create();

api.interceptors.request.use(
  (config) => {
    // Check admin store first (for admin panel)
    let token = useAdminStore.getState().token;

    // If no admin token, check localStorage (for regular user JWT auth)
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("auth_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
