import { api } from "@/lib/axios";
import { Workspace } from "@/types";

export interface WorkspaceInput {
  name: string;
  description?: string | undefined;
}

export const workspacesApi = {
  list: () => api.get<Workspace[]>("/workspaces").then((r) => r.data),

  get: (id: string) =>
    api.get<Workspace>(`/workspaces/${id}`).then((r) => r.data),

  create: (input: WorkspaceInput) =>
    api.post<Workspace>("/workspaces", input).then((r) => r.data),

  transferOwnership: (slug: string, newOwnerId: string) =>
    api
      .patch<Workspace>(`/workspaces/${slug}/transfer-ownership`, {
        newOwnerId,
      })
      .then((r) => r.data),

  leave: (slug: string, newOwnerId?: string) =>
    api
      .post(`/workspaces/${slug}/members/leave`, {
        ...(newOwnerId ? { newOwnerId } : {}),
      })
      .then((r) => r.data),

  update: (id: string, input: WorkspaceInput) =>
    api.patch<Workspace>(`/workspaces/${id}`, input).then((r) => r.data),

  remove: (id: string) => api.delete(`/workspaces/${id}`).then((r) => r.data),
};
