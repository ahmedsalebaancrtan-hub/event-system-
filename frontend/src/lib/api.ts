import axios from "axios";

export const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please try again later.";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const isPublicRequest = (url?: string) => url?.includes("/public/");
const isProtectedRoute = () =>
  window.location.pathname.startsWith("/dashboard");

export const hasAuthTokens = () =>
  Boolean(localStorage.getItem("access_token"));

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

export const getNetworkErrorMessage = (error: any) => {
  const method = error.config?.method?.toUpperCase() || "REQUEST";
  const url = error.config?.url || "unknown endpoint";

  return `Network error: Could not connect to the backend (${method} ${API_BASE_URL}${url}). Make sure the backend is running on port 5002 and restart the frontend dev server after changing .env.`;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE
) => {
  const err = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
      };
    };
    config?: {
      method?: string;
      url?: string;
    };
  };

  if (!err.response) return getNetworkErrorMessage(err);

  const { status, data } = err.response;

  if ([502, 503, 504].includes(status || 0)) {
    return "Backend server is unavailable. Start the Go backend on port 5002, then refresh this page.";
  }

  return data?.message || data?.error || fallback;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (isPublicRequest(config.url)) return config;

  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isPublicRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) return Promise.reject(error);

      const res = await axios.post(
        `${API_BASE_URL}/users/Refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const newAccessToken =
        res.data.access_token || res.data.accessToken;

      const newRefreshToken =
        res.data.refresh_token ||
        res.data.refreshToken ||
        refreshToken;

      localStorage.setItem("access_token", newAccessToken);
      localStorage.setItem("refresh_token", newRefreshToken);

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      if (isProtectedRoute()) {
        window.location.href = "/auth/login";
      }

      return Promise.reject(refreshError);
    }
  }
);