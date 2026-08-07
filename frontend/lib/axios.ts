import { API_BASE_URL, TOKEN_STORAGE_KEY } from "@/constants";
import axios, { type AxiosError } from "axios";
import { mockAdapter } from "./mock/adapter";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  adapter: mockAdapter,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong. Please try again.";
    return Promise.reject(Object.assign(new Error(message), { status: error.response?.status }));
  },
);