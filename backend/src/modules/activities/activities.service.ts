import {
  Inject,
  Injectable,
} from '@nestjs/common';

import { ActivityInterface } from './interfaces/activity.interface.abstract';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(ActivityInterface)
    private readonly activityRepository: ActivityInterface,
  ) {}

  async createActivity(taskId: string, userId: string, action: ActivityType) {
    return this.activityRepository.create({
      action,
      task: {
        connect: {
          id: taskId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    });
  }

  async getActivitiesByTaskId(taskId: string) {
    return this.activityRepository.findAllByTaskId(taskId);
  }

  async getActivityById(activityId: string) {
    return this.activityRepository.findById(activityId);
  }
}
