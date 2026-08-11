import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivityRepository } from './repositories/activity.repository';
import { ActivityInterface } from './interfaces/activity.interface.abstract';

@Module({
  providers: [
    ActivitiesService,
    ActivityRepository,
    {
      provide: ActivityInterface,
      useExisting: ActivityRepository,
    },
  ],
  exports: [ActivitiesService, ActivityInterface],
})
export class ActivitiesModule {}
