import { queryOptions, useQuery } from "@tanstack/react-query";

import { activitiesApi } from "@/features/activities/api";
import { queryKeys } from "@/lib/query-client";

export const activityFeedQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.activities, queryFn: activitiesApi.list });

export const taskActivitiesQueryOptions = (taskId: string) =>
  queryOptions({
    queryKey: queryKeys.taskActivities(taskId),
    queryFn: () => activitiesApi.listByTask(taskId),
  });

export function useActivityFeed() {
  return useQuery(activityFeedQueryOptions());
}

export function useTaskActivities(taskId: string | null) {
  return useQuery({
    ...taskActivitiesQueryOptions(taskId ?? ""),
    enabled: Boolean(taskId),
  });
}

export function useProjectActivities(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectActivities(projectId),
    queryFn: () => activitiesApi.listByProject(projectId),
  });
}

export function useWorkspaceActivities(slug: string) {
  return useQuery({
    queryKey: queryKeys.workspaceActivities(slug),
    queryFn: () => activitiesApi.listByWorkspace(slug),
  });
}
