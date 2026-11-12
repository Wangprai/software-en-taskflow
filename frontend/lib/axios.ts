import {
  API_BASE_URL,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "@/constants";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { AuthResponse } from "@/types";

// Request config with retry flag
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Main API instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Separate instance for refreshing tokens
export const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Access Token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
});

// Prevent multiple simultaneous refresh requests
let refreshPromise: Promise<string> | null = null;

// Clear local session and redirect to login
function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);

  window.location.replace("/login");
}

// Handle API responses
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryConfig | undefined;

    const status = error.response?.status;

    const requestUrl = originalRequest?.url ?? "";

    // Do not refresh for login, register, or refresh requests
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      // Only handle requests that originally had an Access Token
      if (accessToken && originalRequest.headers.get("Authorization")) {
        originalRequest._retry = true;

        if (!refreshToken) {
          clearSession();
          return Promise.reject(error);
        }

        try {
          // Reuse an ongoing refresh request if one already exists
          if (!refreshPromise) {
            refreshPromise = refreshApi
              .post<AuthResponse>("/auth/refresh", { refreshToken })
              .then(({ data }) => {
                localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
                localStorage.setItem(
                  REFRESH_TOKEN_STORAGE_KEY,
                  data.refreshToken,
                );

                return data.accessToken;
              })
              .catch((refreshError) => {
                clearSession();
                throw refreshError;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }

          const newAccessToken = await refreshPromise;

          originalRequest.headers.set(
            "Authorization",
            `Bearer ${newAccessToken}`,
          );

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    const message =
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again.";

    return Promise.reject(
      Object.assign(new Error(message), {
        status: error.response?.status,
      }),
    );
  },
);
