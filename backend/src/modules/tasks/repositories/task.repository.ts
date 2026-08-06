import { Injectable } from '@nestjs/common';
import { TaskInterface } from '../interfaces/task.interface.abstract';
import { Prisma } from '@prisma/client';
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
}
