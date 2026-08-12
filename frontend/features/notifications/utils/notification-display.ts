import type { Notification } from "@/types";

export function getNotificationTitle(
  notification: Notification,
): string {
  switch (notification.type) {
    case "TASK_ASSIGNED":
      return "You have been assigned a task";

    case "COMMENT_ADDED":
      return "New comment added";

    case "STATUS_CHANGED":
      return "Task status changed";

    default:
      return "New notification";
  }
}