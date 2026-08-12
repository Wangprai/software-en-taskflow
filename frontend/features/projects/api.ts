import { api } from "@/lib/axios";
import type { Project } from "@/types";

export interface ProjectInput {
  name: string;
  description?: string | undefined;
}

export const projectsApi = {
  listByWorkspace: (slug: string) =>
    api.get<Project[]>(`/workspaces/${slug}/projects`).then((r) => r.data),

  get: (slug: string, projectId: string) =>
    api
      .get<Project>(`/workspaces/${slug}/projects/${projectId}`)
      .then((r) => r.data),

  create: (slug: string, input: ProjectInput) =>
    api
      .post<Project>(`/workspaces/${slug}/projects`, input)
      .then((r) => r.data),

  update: (slug: string, projectId: string, input: ProjectInput) =>
    api
      .patch<Project>(`/workspaces/${slug}/projects/${projectId}`, input)
      .then((r) => r.data),

  remove: (slug: string, projectId: string) =>
    api.delete(`/workspaces/${slug}/projects/${projectId}`).then((r) => r.data),
};
