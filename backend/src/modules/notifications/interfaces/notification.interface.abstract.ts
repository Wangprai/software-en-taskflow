import { Prisma } from '@prisma/client';
import {
  NotificationDetail,
  NotificationList,
} from '../types/notification.type';

export abstract class NotificationInterface {
  abstract create(
    data: Prisma.NotificationCreateInput,
  ): Promise<NotificationDetail>;

  abstract findAllByUserId(userId: string): Promise<NotificationList>;

  abstract findUnreadByUserId(userId: string): Promise<NotificationList>;

  abstract findById(id: string): Promise<NotificationDetail | null>;

  abstract markAsRead(id: string): Promise<NotificationDetail>;

  abstract markAllAsRead(userId: string): Promise<{ count: number }>;

  abstract delete(id: string): Promise<NotificationDetail>;
}
