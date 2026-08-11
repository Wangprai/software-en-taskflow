import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { commentsApi } from "@/features/comments/api";
import { queryKeys } from "@/lib/query-client";

export const commentsQueryOptions = (taskId: string) =>
  queryOptions({
    queryKey: queryKeys.comments(taskId),
    queryFn: () => commentsApi.listByTask(taskId),
  });

export function useComments(taskId: string | null) {
  return useQuery({ ...commentsQueryOptions(taskId ?? ""), enabled: Boolean(taskId) });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => commentsApi.create(taskId, { body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.comments(taskId) });
      void qc.invalidateQueries({ queryKey: queryKeys.taskActivities(taskId) });
      void qc.invalidateQueries({ queryKey: queryKeys.activities });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.remove(commentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.comments(taskId) });
      toast.success("Comment deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
