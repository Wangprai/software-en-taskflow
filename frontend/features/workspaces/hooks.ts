import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { WorkspaceInput, workspacesApi } from "./api";
import { toast } from "sonner";

export const workspacesQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.workspaces, queryFn: workspacesApi.list });

export const workspaceQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.workspace(slug),
    queryFn: () => workspacesApi.get(slug),
  });

export function useWorkspaces() {
  return useQuery(workspacesQueryOptions());
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkspaceInput) => workspacesApi.create(input),
    onSuccess: (w) => {
      void qc.invalidateQueries({ queryKey: queryKeys.workspaces });
      toast.success(`Workspace “${w.name}” created`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, ...input }: WorkspaceInput & { slug: string }) =>
      workspacesApi.update(slug, input),
    onSuccess: (w) => {
      void qc.invalidateQueries({ queryKey: queryKeys.workspaces });
      void qc.invalidateQueries({ queryKey: queryKeys.workspace(w.slug) });
      toast.success("Workspace updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => workspacesApi.remove(slug),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.workspaces });
      toast.success("Workspace deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}