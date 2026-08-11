import { useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "@/features/tasks/api";
import { queryKeys } from "@/lib/query-client";
import type { Task, TaskStatus } from "@/types";

export const tasksQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: queryKeys.tasks(projectId),
    queryFn: () => tasksApi.listByProject(projectId),
  });

export const allTasksQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.allTasks, queryFn: tasksApi.listAll });

export function useTasks(projectId: string) {
  return useQuery(tasksQueryOptions(projectId));
}

export function useAllTasks() {
  return useQuery(allTasksQueryOptions());
}

function invalidateTaskViews(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  void qc.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
  void qc.invalidateQueries({ queryKey: queryKeys.allTasks });
  void qc.invalidateQueries({ queryKey: queryKeys.activities });
  void qc.invalidateQueries({ queryKey: queryKeys.projectActivities(projectId) });
}

export function useMoveTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.update(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      const key = queryKeys.tasks(projectId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Task[]>(key);
      qc.setQueryData<Task[]>(key, (old) =>
        (old ?? []).map((t) => (t.id === taskId ? { ...t, status } : t)),
      );
      return { previous };
    },
    onError: (error: Error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.tasks(projectId), ctx.previous);
      toast.error(error.message);
    },
    onSettled: () => invalidateTaskViews(qc, projectId),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...input }: Partial<Task> & { taskId: string }) =>
      tasksApi.update(taskId, input),
    onSuccess: (task) => {
      invalidateTaskViews(qc, projectId);
      void qc.invalidateQueries({ queryKey: queryKeys.taskActivities(task.id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Task>) => tasksApi.create(projectId, input),
    onSuccess: () => {
      invalidateTaskViews(qc, projectId);
      void qc.invalidateQueries({ queryKey: queryKeys.project(projectId) });
      toast.success("Task created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId),
    onSuccess: () => {
      invalidateTaskViews(qc, projectId);
      toast.success("Task deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
