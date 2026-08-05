import { Prisma } from '@prisma/client';

export type ProjectDetail =
  Prisma.ProjectGetPayload<{
    include: {
      owner: {
        select: {
          id: true;
          name: true;
          email: true;
        };
      };
      workspace: true;
      _count: {
        select: {
          tasks: true;
        };
      };
    };
  }>;

export type ProjectList = ProjectDetail[];