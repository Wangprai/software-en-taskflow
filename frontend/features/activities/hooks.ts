import { queryOptions, useQuery } from "@tanstack/react-query";

import { activitiesApi } from "@/features/activities/api";
import { queryKeys } from "@/lib/query-client";

export const taskActivitiesQueryOptions = (
  slug: string,
  projectId: string,
  taskId: string,
) =>
  queryOptions({
    queryKey: queryKeys.taskActivities(taskId),
    queryFn: () => activitiesApi.listByTask(slug, projectId, taskId),
  });

export function useTaskActivities(
  slug: string,
  projectId: string,
  taskId: string | null,
) {
  return useQuery({
    ...taskActivitiesQueryOptions(slug, projectId, taskId ?? ""),
    enabled: Boolean(slug && projectId && taskId),
  });
}

export function useProjectActivities(slug: string, projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectActivities(projectId),
    queryFn: () => activitiesApi.listByProject(slug, projectId),
    enabled: Boolean(slug && projectId),
  });
}
