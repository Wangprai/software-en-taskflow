import { api } from "@/lib/axios";
import { Workspace } from "@/types";

export interface WorkspaceInput {
  name: string;
  description?: string | undefined;
}

export const workspacesApi = {
  list: () => api.get<Workspace[]>("/workspaces").then((r) => r.data),
  get: (slug: string) =>
    api.get<Workspace>(`/workspaces/${slug}`).then((r) => r.data),
  create: (input: WorkspaceInput) =>
    api.post<Workspace>("/workspaces", input).then((r) => r.data),
  update: (slug: string, input: WorkspaceInput) =>
    api.patch<Workspace>(`/workspaces/${slug}`, input).then((r) => r.data),
  remove: (slug: string) =>
    api.delete(`/workspaces/${slug}`).then((r) => r.data),
};
