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
  description: string | null;
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  assigneeId: string | null;
  assignee: User | null;
  createdById: string;
  createdBy: User;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  author: User;
  createdAt: string;
}

export type ActivityType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_ASSIGNED"
  | "STATUS_CHANGED"
  | "COMMENT_CREATED"

export interface Activity {
  id: string;
  workspaceId: string;
  projectId: string | null;
  taskId: string | null;
  type: ActivityType;
  actor: User;
  summary: string;
  createdAt: string;
}

export type NotificationType = "MENTION" | "ASSIGNED" | "REVIEW" | "COMMENT" | "COMPLETED" | "DUE";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  taskId: string | null;
  projectId: string | null;
  actor: User | null;
  read: boolean;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}