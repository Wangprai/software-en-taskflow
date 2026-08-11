import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Endpoint to get notifications
  @Get()
  async getNotifications(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getNotifications(user.id);
  }

  // Endpoint to get unread notifications
  @Get('unread')
  async getUnreadNotifications(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getUnreadNotifications(user.id);
  }
  
  // Endpoint to read all notifications
  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  // Endpoint to read a notification
  @Patch(':notificationId/read')
  async markAsRead(
    @Param('notificationId', ParseUUIDPipe)
    notificationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationsService.markAsRead(notificationId, user.id);
  }

  // Endpoint to delete a notification
  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @Param('notificationId', ParseUUIDPipe)
    notificationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.notificationsService.deleteNotification(notificationId, user.id);
  }
}