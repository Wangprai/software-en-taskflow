import { api } from "@/lib/axios";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/types";

export const tasksApi = {
  listByProject: (slug: string, projectId: string) =>
    api
      .get<Task[]>(`/workspaces/${slug}/projects/${projectId}/tasks`)
      .then((r) => r.data),

  create: (slug: string, projectId: string, input: CreateTaskInput) =>
    api
      .post<Task>(`/workspaces/${slug}/projects/${projectId}/tasks`, input)
      .then((r) => r.data),

  update: (
    slug: string,
    projectId: string,
    taskId: string,
    input: UpdateTaskInput,
  ) =>
    api
      .patch<Task>(
        `/workspaces/${slug}/projects/${projectId}/tasks/${taskId}`,
        input,
      )
      .then((r) => r.data),

  remove: (slug: string, projectId: string, taskId: string) =>
    api.delete(`/workspaces/${slug}/projects/${projectId}/tasks/${taskId}`),
};
