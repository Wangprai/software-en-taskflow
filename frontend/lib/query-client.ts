import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  me: ["auth", "me"] as const,
  workspaces: ["workspaces"] as const,
  workspace: (slug: string) => ["workspaces", slug] as const,
  members: (slug: string) => ["workspaces", slug, "members"] as const,
  projects: (slug: string) => ["workspaces", slug, "projects"] as const,
  project: (id: string) => ["projects", id] as const,
  tasks: (projectId: string) => ["projects", projectId, "tasks"] as const,
  allTasks: ["tasks"] as const,
  comments: (taskId: string) => ["tasks", taskId, "comments"] as const,
  taskActivities: (taskId: string) => ["tasks", taskId, "activities"] as const,
  activities: ["activities"] as const,
  workspaceActivities: (slug: string) => ["workspaces", slug, "activities"] as const,
  projectActivities: (projectId: string) => ["projects", projectId, "activities"] as const,
  notifications: ["notifications"] as const,
};

export const queryClient = new QueryClient();
