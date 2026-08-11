import type { TaskPriority, TaskStatus } from "@/types";

export const TOKEN_STORAGE_KEY = "taskflow.token";
export const USER_STORAGE_KEY = "taskflow.user";
export const THEME_STORAGE_KEY = "taskflow.theme";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const ROUTES = {
  login: "/login",
  register: "/register",
} as const;

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "In review",
  DONE: "Done",
};

export const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: "bg-muted-foreground",
  IN_PROGRESS: "bg-info",
  REVIEW: "bg-warning",
  DONE: "bg-success",
};

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "border-transparent bg-muted text-muted-foreground",
  MEDIUM: "border-transparent bg-info/15 text-info",
  HIGH: "border-transparent bg-warning/20 text-warning",
  URGENT: "border-transparent bg-destructive/15 text-destructive",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
export const PRIORITY_ORDER: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
