import { Prisma } from '@prisma/client';
import { TaskDetail, TaskList } from '../types/task.type';

export abstract class TaskInterface {
  abstract create(data: Prisma.TaskCreateInput): Promise<TaskDetail>;

  abstract findAllByProjectId(projectId: string): Promise<TaskList>;

  abstract findById(id: string): Promise<TaskDetail | null>;

  abstract findLastPosition(projectId: string): Promise<number>;

  abstract findByProjectAndId(
    projectId: string,
    taskId: string,
  ): Promise<TaskDetail | null>;

  abstract update(
    id: string,
    data: Prisma.TaskUpdateInput,
  ): Promise<TaskDetail>;

  abstract delete(id: string): Promise<TaskDetail>;
}
