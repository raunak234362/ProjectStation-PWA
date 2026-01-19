/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

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

  console.log(
    `Axios Request: ${config.method?.toUpperCase()} ${config.url}`,
    config
  );
  return config;
});

export default instance;
