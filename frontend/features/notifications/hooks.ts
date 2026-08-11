import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationsApi } from "@/features/notifications/api";
import { queryKeys } from "@/lib/query-client";

export const notificationsQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.notifications, queryFn: notificationsApi.list });

export function useNotifications() {
  return useQuery(notificationsQueryOptions());
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read?: boolean }) =>
      notificationsApi.markRead(id, read ?? true),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.notifications }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
      toast.success("All notifications marked as read");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
