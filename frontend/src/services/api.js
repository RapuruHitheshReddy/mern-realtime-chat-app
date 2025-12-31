import axios from "axios";

/**
 * Base API instance
 * Automatically switches between dev & prod
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // keep false unless using cookies
});

/* ------------------------------
   Request interceptor (auth)
------------------------------ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ------------------------------
   Response interceptor (optional)
------------------------------ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional global error handling
    return Promise.reject(
      error.response?.data || { message: error.message }
    );
  }
);

export default api;
