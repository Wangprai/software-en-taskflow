export type Role = "ADMIN" | "MEMBER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

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

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  memberCount: number;
  projectCount: number;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  user: User;
  role: Role;
  joinedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string;
  createdAt: string;
  taskCount: number;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: User | null;
  dueDate: string | null;
  order: number;
}
