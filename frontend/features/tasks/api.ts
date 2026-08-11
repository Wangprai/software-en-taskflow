import { api } from "@/lib/axios";
import type { Task } from "@/types";

export const tasksApi = {
  listAll: () => api.get<Task[]>("/tasks").then((r) => r.data),
  listByProject: (projectId: string) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`).then((r) => r.data),
  create: (projectId: string, input: Partial<Task>) =>
    api.post<Task>(`/projects/${projectId}/tasks`, input).then((r) => r.data),
  update: (taskId: string, input: Partial<Task>) =>
    api.patch<Task>(`/tasks/${taskId}`, input).then((r) => r.data),
  remove: (taskId: string) => api.delete(`/tasks/${taskId}`).then((r) => r.data),
};

