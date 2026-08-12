import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationInterface } from './interfaces/notification.interface.abstract';
import {
  NotificationDetail,
  NotificationList,
} from './types/notification.type';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NotificationInterface)
    private readonly notificationRepository: NotificationInterface,
  ) {}

  // Create a notification
  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<NotificationDetail> {
    return this.notificationRepository.create({
      user: {
        connect: {
          id: dto.userId,
        },
      },
      type: dto.type,
      message: dto.message,
      ...(dto.payload !== undefined && {
        payload: dto.payload,
      }),
    });
  }

  // Get all notifications
  async getNotifications(currentUserId: string): Promise<NotificationList> {
    return this.notificationRepository.findAllByUserId(currentUserId);
  }

  // Get unread notifications
  async getUnreadNotifications(
    currentUserId: string,
  ): Promise<NotificationList> {
    return this.notificationRepository.findUnreadByUserId(currentUserId);
  }

  // Mark as read a notification
  async markAsRead(
    notificationId: string,
    currentUserId: string,
  ): Promise<NotificationDetail> {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Check ownership
    if (notification.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own notification');
    }

    return this.notificationRepository.markAsRead(notificationId);
  }

  // Mark all as read notifications
  async markAllAsRead(currentUserId: string): Promise<{ count: number }> {
    return this.notificationRepository.markAllAsRead(currentUserId);
  }

  // Delete a notification
  async deleteNotification(
    notificationId: string,
    currentUserId: string,
  ): Promise<NotificationDetail> {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Check ownership
    if (notification.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own notification');
    }

    return this.notificationRepository.delete(notificationId);
  }
}
