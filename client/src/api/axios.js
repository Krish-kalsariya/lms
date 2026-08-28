import axios from "axios";
import toast from "react-hot-toast";

let rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
rawBaseURL = rawBaseURL.replace(/\/+$/, "");
if (!rawBaseURL.endsWith("/api/v1")) {
  rawBaseURL += "/api/v1";
}

const api = axios.create({
  baseURL: rawBaseURL,
  withCredentials: true,
});

let activeRequests = 0;

const showLoader = (setLoading) => {
  activeRequests++;
  setLoading(true);
};

const hideLoader = (setLoading) => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    setLoading(false);
  }
};

export const setupInterceptors = (setLoading) => {
  // REQUEST
  api.interceptors.request.use(
    (config) => {
      showLoader(setLoading);
      return config;
    },
    (error) => {
      hideLoader(setLoading);
      return Promise.reject(error);
    }
  );

  // RESPONSE
  api.interceptors.response.use(
    (response) => {
      hideLoader(setLoading);
      return response;
    },
    (error) => {
      hideLoader(setLoading);

      // 🔐 SESSION EXPIRED
      if (error.response?.status === 401) {
        const user = localStorage.getItem("user");

        // Only force logout if user was logged in
        if (user) {
          toast.error("Session expired. Please login again.");

          localStorage.removeItem("user");

          // Reset loader state (important)
          activeRequests = 0;
          setLoading(false);

          window.location.href = "/login";
        }

        return Promise.reject(error);
      }

      toast.error(error.response?.data?.message || "Something went wrong");
      return Promise.reject(error);
    }
  );
};

export default api;