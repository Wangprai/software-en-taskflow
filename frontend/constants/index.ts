export const TOKEN_STORAGE_KEY = "taskflow.token";
export const USER_STORAGE_KEY = "taskflow.user";
export const THEME_STORAGE_KEY = "taskflow.theme";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const ROUTES = {
  login: "/login",
  register: "/register",
} as const;