import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { projectsApi, type ProjectInput } from "@/features/projects/api";
import { queryKeys } from "@/lib/query-client";

export const projectsQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.projects(slug),
    queryFn: () => projectsApi.listByWorkspace(slug),
  });

export const projectQueryOptions = (slug: string, projectId: string) =>
  queryOptions({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectsApi.get(slug, projectId),
  });

export function useProjects(slug: string) {
  return useQuery(projectsQueryOptions(slug));
}

export function useProject(slug: string, projectId: string) {
  return useQuery({
    ...projectQueryOptions(slug, projectId),
    enabled: Boolean(slug && projectId),
  });
}

export function useCreateProject(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) => projectsApi.create(slug, input),
    onSuccess: (p) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects(slug) });
      void qc.invalidateQueries({ queryKey: queryKeys.workspaces });
      toast.success(`Project “${p.name}” created`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProject(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: ProjectInput & { id: string }) =>
      projectsApi.update(slug, id, input),

    onSuccess: (p) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.projects(slug),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.project(p.id),
      });

      toast.success("Project updated");
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}

export function useDeleteProject(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.remove(slug, projectId),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.projects(slug),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.workspaces,
      });

      toast.success("Project deleted");
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}
