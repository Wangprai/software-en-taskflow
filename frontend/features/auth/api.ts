import { api, refreshApi } from "@/lib/axios";
import { AuthResponse, RegisterResponse, User } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (input: LoginInput) =>
    api
      .post<AuthResponse>("/auth/login", input)
      .then((response) => response.data),

  register: (input: RegisterInput) =>
    api
      .post<RegisterResponse>("/auth/register", input)
      .then((response) => response.data),

  me: () => api.get<User>("/auth/me").then((response) => response.data),

  refresh: (refreshToken: string) =>
    refreshApi
      .post<AuthResponse>("/auth/refresh", { refreshToken })
      .then((response) => response.data),

  logout: () => api.post("/auth/logout"),
};
