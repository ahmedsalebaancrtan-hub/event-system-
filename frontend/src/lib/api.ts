import axios from "axios";



export const DEFUALT_ERROR_MESSEGE =

  "Something went wrong. Please try again later.";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const getNetworkErrorMessage = (error: any) => {
  const method = error.config?.method?.toUpperCase() || "REQUEST";
  const url = error.config?.url || "unknown endpoint";

  return `Network error: Could not connect to the backend (${method} ${API_BASE_URL}${url}). Make sure the backend is running on port 5002 and restart the frontend dev server after changing .env.`;
};



export const api = axios.create({

  baseURL: API_BASE_URL,

});



api.interceptors.request.use((config) => {

  const token = localStorage.getItem("access_token");

  if (token && config.headers) {

    config.headers.Authorization = `Bearer ${token}`;

  }

  return config;

});



api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    

    // If error is 401 and we haven't retried yet

    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true;

      

      try {

        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {

          // Reject with the original error instead of throwing a new error

          // so that the calling code (like LoginForm) gets the proper response object.

          return Promise.reject(error);

        }

        

        // Attempt to get a new access token

        const res = await axios.post(`${API_BASE_URL}/users/Refresh-token`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        

        const newAccessToken = res.data.access_token || res.data.accessToken;

        const newRefreshToken = res.data.refresh_token || res.data.refreshToken || refreshToken;

        

        // Save new tokens

        localStorage.setItem("access_token", newAccessToken);

        localStorage.setItem("refresh_token", newRefreshToken);

        

        // Update header and retry the original request

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {

        // Refresh failed, disturb access

        localStorage.removeItem("access_token");

        localStorage.removeItem("refresh_token");

        window.location.href = "/auth/login";

        return Promise.reject(refreshError);

      }

    }

    

    return Promise.reject(error);

  }

);
