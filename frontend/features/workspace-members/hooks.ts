import { useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { membersApi, type AddMemberInput } from "@/features/workspace-members/api";
import { queryKeys } from "@/lib/query-client";
import type { Role } from "@/types";

export const membersQueryOptions = (slug: string) =>
  queryOptions({ queryKey: queryKeys.members(slug), queryFn: () => membersApi.list(slug) });

export function useMembers(slug: string) {
  return useQuery(membersQueryOptions(slug));
}

export function useAddMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMemberInput) => membersApi.add(slug, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.members(slug) });
      void qc.invalidateQueries({ queryKey: queryKeys.workspaces });
      toast.success("Member added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMemberRole(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      membersApi.updateRole(slug, memberId, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.members(slug) });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => membersApi.remove(slug, memberId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.members(slug) });
      void qc.invalidateQueries({ queryKey: queryKeys.workspaces });
      toast.success("Member removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
