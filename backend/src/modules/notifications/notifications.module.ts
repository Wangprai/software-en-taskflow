import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationInterface } from './interfaces/notification.interface.abstract';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    {
      provide: NotificationInterface,
      useExisting: NotificationRepository,
    },
  ],
  exports: [NotificationsService, NotificationInterface],
})
export class NotificationsModule {}
