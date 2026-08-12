import { NotificationType, Prisma } from '@prisma/client';
import { notificationInclude } from './notification.include';

export type NotificationWithRelations = Prisma.NotificationGetPayload<{
  include: typeof notificationInclude;
}>;

export interface NotificationDetail {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  taskId: string | null;
  projectId: string | null;
  actor: {
    id: string;
    name: string;
    email: string;
  } | null;
  read: boolean;
  createdAt: Date;
}

export type NotificationList = NotificationDetail[];

export interface NotificationPayload {
  taskId?: string;
  projectId?: string;
  workspaceSlug?: string;
  status?: string;
}
