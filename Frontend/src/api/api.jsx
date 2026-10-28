import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8091",
  timeout: 90000,
});

// Automatically attach JWT to API requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set Content-Type and boundary for FormData.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
