import { Prisma } from "@prisma/client";
import { notificationInclude } from "./notification.include";

export type NotificationDetail = Prisma.NotificationGetPayload<{
  include: typeof notificationInclude;
}>;

export type NotificationList = NotificationDetail[];