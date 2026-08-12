import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActivityInterface } from '../interfaces/activity.interface.abstract';
import {
  ActivityDetail,
  ActivityList,
  ActivityWithRelations,
} from '../types/activity.type';
import { activityInclude } from '../types/activity.include';

@Injectable()
export class ActivityRepository implements ActivityInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Creat an activity
  async create(data: Prisma.ActivityCreateInput): Promise<ActivityDetail> {
    const activity = await this.prisma.activity.create({
      data,
      include: activityInclude,
    });

    return this.toActivityDetail(activity);
  }

  // Find all activities by task ID
  async findAllByTaskId(taskId: string): Promise<ActivityList> {
    const activities = await this.prisma.activity.findMany({
      where: {
        taskId,
      },
      include: activityInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return activities.map((activity) => this.toActivityDetail(activity));
  }

  // Find an activity by ID
  async findById(id: string): Promise<ActivityDetail | null> {
    const activity = await this.prisma.activity.findUnique({
      where: {
        id,
      },
      include: activityInclude,
    });

    return activity ? this.toActivityDetail(activity) : null;
  }

  // Delete an activity
  async delete(id: string): Promise<ActivityDetail> {
    const activity = await this.prisma.activity.delete({
      where: {
        id,
      },
      include: activityInclude,
    });

    return this.toActivityDetail(activity);
  }

  // Helper function for convert Prisma activity to API response
  private toActivityDetail(activity: ActivityWithRelations): ActivityDetail {
    return {
      id: activity.id,
      type: activity.action,
      taskId: activity.taskId,
      projectId: activity.task.projectId,
      actor: activity.user,
      summary: this.getSummary(activity),
      createdAt: activity.createdAt,
    };
  }

  // Helper function for generate activity summary
  private getSummary(activity: ActivityWithRelations): string {
    switch (activity.action) {
      case 'TASK_CREATED':
        return `created task "${activity.task.title}"`;

      case 'TASK_UPDATED':
        return `updated task "${activity.task.title}"`;

      case 'TASK_ASSIGNED':
        return `assigned task "${activity.task.title}"`;

      case 'STATUS_CHANGED':
        return `changed status of "${activity.task.title}"`;

      case 'COMMENT_CREATED':
        return `commented on "${activity.task.title}"`;

      default:
        return 'performed an action';
    }
  }
}
