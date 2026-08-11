import { api } from "@/lib/axios";
import type { Notification } from "@/types";

export type { Notification };

export const notificationsApi = {
  list: () => api.get<Notification[]>("/notifications").then((r) => r.data),
  markRead: (id: string, read = true) =>
    api.patch<Notification>(`/notifications/${id}`, { read }).then((r) => r.data),
  markAllRead: () => api.post<Notification[]>("/notifications/read-all").then((r) => r.data),
  remove: (id: string) => api.delete(`/notifications/${id}`).then((r) => r.data),
};