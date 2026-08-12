import { api } from "@/lib/axios";
import type { Activity } from "@/types";

export const activitiesApi = {
  list: () => api.get<Activity[]>("/activities").then((r) => r.data),

  listByWorkspace: (slug: string) =>
    api.get<Activity[]>(`/workspaces/${slug}/activities`).then((r) => r.data),

  listByProject: (slug: string, projectId: string) =>
    api
      .get<Activity[]>(`/workspaces/${slug}/projects/${projectId}/activities`)
      .then((r) => r.data),

  listByTask: (slug: string, projectId: string, taskId: string) =>
    api
      .get<
        Activity[]
      >(`/workspaces/${slug}/projects/${projectId}/tasks/${taskId}/activities`)
      .then((r) => r.data),
};
