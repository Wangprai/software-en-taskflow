import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationInterface } from '../interfaces/notification.interface.abstract';
import { notificationInclude } from '../types/notification.include';
import {
  NotificationDetail,
  NotificationList,
  NotificationPayload,
  NotificationWithRelations,
} from '../types/notification.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationRepository implements NotificationInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create notification
  async create(
    data: Prisma.NotificationCreateInput,
  ): Promise<NotificationDetail> {
    const notification = await this.prisma.notification.create({
      data,
      include: notificationInclude,
    });

    return this.toNotificationDetail(notification);
  }

  // Find all notifications by user ID
  async findAllByUserId(userId: string): Promise<NotificationList> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      include: notificationInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map((notification) =>
      this.toNotificationDetail(notification),
    );
  }

  // Find unread notifications by user ID
  async findUnreadByUserId(userId: string): Promise<NotificationList> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      include: notificationInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map((notification) =>
      this.toNotificationDetail(notification),
    );
  }

  // Find a notification by ID
  async findById(id: string): Promise<NotificationDetail | null> {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id,
      },
      include: notificationInclude,
    });

    return notification ? this.toNotificationDetail(notification) : null;
  }

  // Mark as read a notification
  async markAsRead(id: string): Promise<NotificationDetail> {
    const notification = await this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
      include: notificationInclude,
    });

    return this.toNotificationDetail(notification);
  }

  // Mark all as read notifications
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  // Delete a notification
  async delete(id: string): Promise<NotificationDetail> {
    const notification = await this.prisma.notification.delete({
      where: {
        id,
      },
      include: notificationInclude,
    });

    return this.toNotificationDetail(notification);
  }

  // Helper forconvert Prisma notification to API response
  private toNotificationDetail(
    notification: NotificationWithRelations,
  ): NotificationDetail {
    const payload = this.getPayload(notification.payload);

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: this.getNotificationTitle(notification.type),
      body: notification.message,
      taskId: payload.taskId ?? null,
      projectId: payload.projectId ?? null,
      actor: notification.user ?? null,
      read: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  // Helper for convert Prisma JSON payload to NotificationPayload
  private getPayload(payload: Prisma.JsonValue | null): NotificationPayload {
    if (
      payload !== null &&
      typeof payload === 'object' &&
      !Array.isArray(payload)
    ) {
      return payload as NotificationPayload;
    }

    return {};
  }

  private getNotificationTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        return 'Task assigned';

      case NotificationType.COMMENT_ADDED:
        return 'New comment';

      case NotificationType.STATUS_CHANGED:
        return 'Task status changed';

      default:
        return 'Notification';
    }
  }
}
