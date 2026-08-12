import { queryOptions, useQuery } from "@tanstack/react-query";

import { activitiesApi } from "@/features/activities/api";
import { queryKeys } from "@/lib/query-client";

export const activityFeedQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.activities, queryFn: activitiesApi.list });

export const taskActivitiesQueryOptions = (
  slug: string,
  projectId: string,
  taskId: string,
) =>
  queryOptions({
    queryKey: queryKeys.taskActivities(taskId),
    queryFn: () => activitiesApi.listByTask(slug, projectId, taskId),
  });

export function useActivityFeed() {
  return useQuery(activityFeedQueryOptions());
}

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

export function useWorkspaceActivities(slug: string) {
  return useQuery({
    queryKey: queryKeys.workspaceActivities(slug),
    queryFn: () => activitiesApi.listByWorkspace(slug),
  });
}
