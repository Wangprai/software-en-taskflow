import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationInterface } from '../interfaces/notification.interface.abstract';
import { notificationInclude } from '../types/notification.include';
import {
  NotificationDetail,
  NotificationList,
} from '../types/notification.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationRepository implements NotificationInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create notification
  async create(
    data: Prisma.NotificationCreateInput,
  ): Promise<NotificationDetail> {
    return this.prisma.notification.create({
      data,
      include: notificationInclude,
    });
  }

  // Find all notifications by user ID
  async findAllByUserId(userId: string): Promise<NotificationList> {
    return this.prisma.notification.findMany({
      where: { userId },
      include: notificationInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Find unread notifications by user ID
  async findUnreadByUserId(userId: string): Promise<NotificationList> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      include: notificationInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Find a notification by ID
  async findById(id: string): Promise<NotificationDetail | null> {
    return this.prisma.notification.findUnique({
      where: { id },
      include: notificationInclude,
    });
  }

  // Mark as read a notifications
  async markAsRead(id: string): Promise<NotificationDetail> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
      include: notificationInclude,
    });
  }

  // Mark all as read a notifications
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

  // Delete a notifications
  async delete(id: string): Promise<NotificationDetail> {
    return this.prisma.notification.delete({
      where: {
        id,
      },
      include: notificationInclude,
    });
  }
}
