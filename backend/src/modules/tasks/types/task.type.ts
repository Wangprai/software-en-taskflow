import { Prisma } from '@prisma/client';

export type TaskDetail = Prisma.TaskGetPayload<{
  include: {
    project: true;
    assignee: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    createdBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export type TaskList = TaskDetail[];
