import { ActivityType, Prisma } from '@prisma/client';
import { activityInclude } from './activity.include';

export type ActivityWithRelations =
  Prisma.ActivityGetPayload<{
    include: typeof activityInclude;
  }>;

export interface ActivityDetail {
  id: string;
  type: ActivityType;
  taskId: string;
  projectId: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  summary: string;
  createdAt: Date;
}

export type ActivityList = ActivityDetail[];