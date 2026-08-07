export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}
