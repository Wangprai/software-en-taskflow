import { Prisma } from '@prisma/client';
import { taskInclude } from './task.include';

export type TaskDetail = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

export type TaskList = TaskDetail[];
