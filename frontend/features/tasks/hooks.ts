import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "@/features/tasks/api";
import { queryKeys } from "@/lib/query-client";
import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from "@/types";

export const tasksQueryOptions = (slug: string, projectId: string) =>
  queryOptions({
    queryKey: queryKeys.tasks(projectId),
    queryFn: () => tasksApi.listByProject(slug, projectId),
  });

export function useTasks(slug: string, projectId: string) {
  return useQuery({
    ...tasksQueryOptions(slug, projectId),
    enabled: Boolean(slug && projectId),
  });
}

export function useMoveTask(slug: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
      position,
    }: {
      taskId: string;
      status: TaskStatus;
      position: number;
    }) =>
      tasksApi.update(slug, projectId, taskId, {
        status,
        position,
      }),

    onMutate: async ({ taskId, status, position }) => {
      const key = queryKeys.tasks(projectId);

      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData<Task[]>(key);

      if (!previous) return { previous };

      const movingTask = previous.find((t) => t.id === taskId);

      if (!movingTask) return { previous };

      const sourceStatus = movingTask.status;

      const sourceTasks = previous
        .filter((t) => t.status === sourceStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position);

      const targetTasks =
        sourceStatus === status
          ? sourceTasks
          : previous
              .filter((t) => t.status === status && t.id !== taskId)
              .sort((a, b) => a.position - b.position);

      const insertPosition = Math.max(
        0,
        Math.min(position, targetTasks.length),
      );

      targetTasks.splice(insertPosition, 0, {
        ...movingTask,
        status,
      });

      const updates = new Map<string, Partial<Task>>();

      sourceTasks.forEach((task, index) => {
        updates.set(task.id, { position: index });
      });

      targetTasks.forEach((task, index) => {
        updates.set(task.id, {
          status,
          position: index,
        });
      });

      qc.setQueryData<Task[]>(
        key,
        previous.map((task) => {
          const update = updates.get(task.id);
          return update ? { ...task, ...update } : task;
        }),
      );

      return { previous };
    },

    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.tasks(projectId), context.previous);
      }

      toast.error(error.message);
    },

    onSettled: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.tasks(projectId),
      });
    },
  });
}

export function useUpdateTask(slug: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      ...input
    }: UpdateTaskInput & {
      taskId: string;
    }) => tasksApi.update(slug, projectId, taskId, input),

    onSuccess: (task) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.tasks(projectId),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.taskActivities(task.id),
      });
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}

export function useCreateTask(slug: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      tasksApi.create(slug, projectId, input),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.tasks(projectId),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.project(projectId),
      });

      toast.success("Task created");
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}

export function useDeleteTask(slug: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(slug, projectId, taskId),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.tasks(projectId),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.project(projectId),
      });

      toast.success("Task deleted");
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}
