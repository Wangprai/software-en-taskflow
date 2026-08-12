import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { commentsApi } from "@/features/comments/api";
import { queryKeys } from "@/lib/query-client";

export const commentsQueryOptions = (
  slug: string,
  projectId: string,
  taskId: string,
) =>
  queryOptions({
    queryKey: queryKeys.comments(taskId),
    queryFn: () =>
      commentsApi.listByTask(slug, projectId, taskId),
  });

export function useComments(
  slug: string,
  projectId: string,
  taskId: string | null,
) {
  return useQuery({
    ...commentsQueryOptions(slug, projectId, taskId ?? ""),
    enabled: Boolean(slug && projectId && taskId),
  });
}

export function useCreateComment(
  slug: string,
  projectId: string,
  taskId: string,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      commentsApi.create(
        slug,
        projectId,
        taskId,
        { content },
      ),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.comments(taskId),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.taskActivities(taskId),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.activities,
      });

      toast.success("Comment added");
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}

export function useUpdateComment(
  slug: string,
  projectId: string,
  taskId: string,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) =>
      commentsApi.update(
        slug,
        projectId,
        taskId,
        commentId,
        { content },
      ),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.comments(taskId),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.taskActivities(taskId),
      });

      void qc.invalidateQueries({
        queryKey: queryKeys.activities,
      });

      toast.success("Comment updated");
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}

export function useDeleteComment(
  slug: string,
  projectId: string,
  taskId: string,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      commentsApi.remove(
        slug,
        projectId,
        taskId,
        commentId,
      ),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.comments(taskId),
      });

      toast.success("Comment deleted");
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
}
