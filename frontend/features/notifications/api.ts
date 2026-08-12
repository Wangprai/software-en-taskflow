import { api } from "@/lib/axios";
import type { Notification } from "@/types";

export const notificationsApi = {
  list: () => api.get<Notification[]>("/notifications").then((r) => r.data),

  listUnread: () =>
    api.get<Notification[]>("/notifications/unread").then((r) => r.data),

  markRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch<Notification[]>("/notifications/read-all").then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};
