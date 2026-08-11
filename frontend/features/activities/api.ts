import { api } from "@/lib/axios";
import type { Activity, ActivityType } from "@/types";

export type { Activity, ActivityType };

export const activitiesApi = {
  list: () => api.get<Activity[]>("/activities").then((r) => r.data),
  listByWorkspace: (slug: string) =>
    api.get<Activity[]>(`/workspaces/${slug}/activities`).then((r) => r.data),
  listByProject: (projectId: string) =>
    api.get<Activity[]>(`/projects/${projectId}/activities`).then((r) => r.data),
  listByTask: (taskId: string) =>
    api.get<Activity[]>(`/tasks/${taskId}/activities`).then((r) => r.data),
};
