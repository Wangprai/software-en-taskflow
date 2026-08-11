import { Prisma } from '@prisma/client';
import {
  ActivityDetail,
  ActivityList,
} from '../types/activity.type';

export abstract class ActivityInterface {
  abstract create(
    data: Prisma.ActivityCreateInput,
  ): Promise<ActivityDetail>;

  abstract findAllByTaskId(
    taskId: string,
  ): Promise<ActivityList>;

  abstract findById(
    id: string,
  ): Promise<ActivityDetail | null>;

  abstract delete(
    id: string,
  ): Promise<ActivityDetail>;
}