import { Prisma } from '@prisma/client';
import { activityInclude } from './activity.include';

export type ActivityDetail = Prisma.ActivityGetPayload<{
  include: typeof activityInclude;
}>;

export type ActivityList = ActivityDetail[];