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

export const tasksQueryOptions = (
  slug: string,
  projectId: string,
) =>
  queryOptions({
    queryKey: queryKeys.tasks(projectId),
    queryFn: () =>
      tasksApi.listByProject(slug, projectId),
  });

// export const allTasksQueryOptions = () =>
//   queryOptions({ queryKey: queryKeys.allTasks, queryFn: tasksApi.listAll });

export function useTasks(
  slug: string,
  projectId: string,
) {
  return useQuery({
    ...tasksQueryOptions(slug, projectId),
    enabled: Boolean(slug && projectId),
  });
}

// export function useAllTasks() {
//   return useQuery(allTasksQueryOptions());
// }

function invalidateTaskViews(
  qc: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  void qc.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
  void qc.invalidateQueries({ queryKey: queryKeys.allTasks });
  void qc.invalidateQueries({ queryKey: queryKeys.activities });
  void qc.invalidateQueries({
    queryKey: queryKeys.projectActivities(projectId),
  });
}

export function useMoveTask(slug: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.update(slug, projectId, taskId, { status }),

    onMutate: async ({ taskId, status }) => {
      const key = queryKeys.tasks(projectId);

      await qc.cancelQueries({
        queryKey: key,
      });

      const previous = qc.getQueryData<Task[]>(key);

      qc.setQueryData<Task[]>(key, (old) =>
        (old ?? []).map((task) =>
          task.id === taskId ? { ...task, status } : task,
        ),
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
