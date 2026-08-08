import { api } from "@/lib/axios";
import type { Project } from "@/types";

export interface ProjectInput {
  name: string;
  description?: string | undefined;
}

export const projectsApi = {
  listByWorkspace: (slug: string) =>
    api.get<Project[]>(`/workspaces/${slug}/projects`).then((r) => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (slug: string, input: ProjectInput) =>
    api.post<Project>(`/workspaces/${slug}/projects`, input).then((r) => r.data),
  update: (id: string, input: ProjectInput) =>
    api.patch<Project>(`/projects/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),
};
