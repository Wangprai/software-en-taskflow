import { api } from "@/lib/axios";
import type { Role, WorkspaceMember } from "@/types";

export interface AddMemberInput {
  email: string;
  role: Role;
}

export const membersApi = {
  list: (slug: string) =>
    api.get<WorkspaceMember[]>(`/workspaces/${slug}/members`).then((r) => r.data),
  add: (slug: string, input: AddMemberInput) =>
    api.post<WorkspaceMember>(`/workspaces/${slug}/members`, input).then((r) => r.data),
  remove: (slug: string, memberId: string) =>
    api.delete(`/workspaces/${slug}/members/${memberId}`).then((r) => r.data),
};
