import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BASE_URL;

if (!baseURL) {
  console.error(
    "CRITICAL ERROR: VITE_BASE_URL is not defined in the environment variables."
  );
}

const normalizedBaseURL = baseURL
  ? baseURL.endsWith("/")
    ? baseURL
    : `${baseURL}/`
  : "/"; // Fallback to root if undefined to prevent crash

const instance = axios.create({
  baseURL: normalizedBaseURL,
});

console.log("API base URL:", instance.defaults.baseURL);

instance.interceptors.request.use((config: any) => {
  // Ensure headers exists
  config.headers = config.headers ?? {};

  // Add token if available
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // console.log(
  //   `Axios Request: ${config.method?.toUpperCase()} ${config.url}`,
  //   config
  // );
  return config;
});

// Response Interceptor for Error Handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();

    // Global 401: Unauthorized session
    if (status === 401) {
      sessionStorage.clear();
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    // Only show toast here if it's a mutation (POST, PUT, DELETE) 
    // to avoid nagging on every background fetch failure
    if (method !== "GET" && !error.config?._noToast) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      
      // We use a small delay or a check to prevent duplicate toasts if component also has one?
      // Actually, duplications are better than missing toasts.
      toast.error(`Error: ${message}`);
    }

    return Promise.reject(error);
  }
);

export default instance;
