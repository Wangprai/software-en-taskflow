import { Prisma } from '@prisma/client';

export const activityInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  task: {
    select: {
      id: true,
      title: true,
      projectId: true,
    },
  },
} satisfies Prisma.ActivityInclude;