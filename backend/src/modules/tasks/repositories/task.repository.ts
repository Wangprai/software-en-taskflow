import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskInterface } from '../interfaces/task.interface.abstract';
import { Prisma, TaskStatus } from '@prisma/client';
import { TaskDetail, TaskList } from '../types/task.type';
import { PrismaService } from '../../../prisma/prisma.service';
import { taskInclude } from '../types/task.include';

@Injectable()
export class TaskRepository implements TaskInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create task in project in database
  async create(data: Prisma.TaskCreateInput): Promise<TaskDetail> {
    return this.prisma.task.create({
      data,
      include: taskInclude,
    });
  }

  // Find all tasks by project ID
  async findAllByProjectId(projectId: string): Promise<TaskList> {
    return this.prisma.task.findMany({
      where: {
        projectId,
      },
      include: taskInclude,
      orderBy: {
        position: 'asc',
      },
    });
  }

  // Find task by project ID and task ID
  async findByProjectAndId(
    projectId: string,
    taskId: string,
  ): Promise<TaskDetail | null> {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      include: taskInclude,
    });
  }

  // Find task by ID
  async findById(id: string): Promise<TaskDetail | null> {
    return this.prisma.task.findUnique({
      where: {
        id,
      },
      include: taskInclude,
    });
  }

  // find last position of task
  async findLastPosition(projectId: string): Promise<number> {
    const task = await this.prisma.task.findFirst({
      where: {
        projectId,
      },
      orderBy: {
        position: 'desc',
      },
    });

    return task ? task.position : -1;
  }

  // Update task
  async update(id: string, data: Prisma.TaskUpdateInput): Promise<TaskDetail> {
    return this.prisma.task.update({
      where: {
        id,
      },
      data,
      include: taskInclude,
    });
  }

  // Delete task
  async delete(id: string): Promise<TaskDetail> {
    return this.prisma.task.delete({
      where: { id },
      include: taskInclude,
    });
  }

  // Re order task
  async reorder(
    taskId: string,
    projectId: string,
    status: TaskStatus,
    position?: number,
  ): Promise<TaskDetail> {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: {
          id: taskId,
          projectId,
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const sourceStatus = task.status;

      // Get tasks in destination column, excluding current task
      const targetTasks = await tx.task.findMany({
        where: {
          projectId,
          status,
          id: { not: taskId },
        },
        orderBy: { position: 'asc' },
      });

      const insertPosition = Math.max(
        0,
        Math.min(position ?? targetTasks.length, targetTasks.length),
      );

      targetTasks.splice(insertPosition, 0, task);

      // Reindex source column if status changed
      if (sourceStatus !== status) {
        const sourceTasks = await tx.task.findMany({
          where: {
            projectId,
            status: sourceStatus,
            id: { not: taskId },
          },
          orderBy: { position: 'asc' },
        });

        for (const [index, item] of sourceTasks.entries()) {
          await tx.task.update({
            where: { id: item.id },
            data: { position: index },
          });
        }
      }

      // Update status and position of destination tasks
      for (const [index, item] of targetTasks.entries()) {
        await tx.task.update({
          where: { id: item.id },
          data: {
            status,
            position: index,
          },
        });
      }

      return tx.task.findUniqueOrThrow({
        where: { id: taskId },
        include: taskInclude,
      });
    });
  }
}
