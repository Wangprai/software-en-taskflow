import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { ActivityInterface } from '../interfaces/activity.interface.abstract';
import {
  ActivityDetail,
  ActivityList,
} from '../types/activity.type';
import { activityInclude } from '../types/activity.include';

@Injectable()
export class ActivityRepository implements ActivityInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.ActivityCreateInput,
  ): Promise<ActivityDetail> {
    return this.prisma.activity.create({
      data,
      include: activityInclude,
    });
  }

  async findAllByTaskId(
    taskId: string,
  ): Promise<ActivityList> {
    return this.prisma.activity.findMany({
      where: {
        taskId,
      },
      include: activityInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(
    id: string,
  ): Promise<ActivityDetail | null> {
    return this.prisma.activity.findUnique({
      where: {
        id,
      },
      include: activityInclude,
    });
  }

  async delete(
    id: string,
  ): Promise<ActivityDetail> {
    return this.prisma.activity.delete({
      where: {
        id,
      },
      include: activityInclude,
    });
  }
}