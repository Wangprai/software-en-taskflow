import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskInterface } from './interfaces/task.interface.abstract';
import { ProjectInterface } from '../projects/interfaces/project.interface.abstract';
import { UserInterface } from '../users/interfaces/user.interface.abstract';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { TaskDetail, TaskList } from './types/task.type';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType, NotificationType, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TaskInterface)
    private readonly taskRepository: TaskInterface,

    @Inject(ProjectInterface)
    private readonly projectRepository: ProjectInterface,

    @Inject(UserInterface)
    private readonly userRepository: UserInterface,

    private readonly workspaceAccessService: WorkspaceAccessService,

    private readonly activitiesService: ActivitiesService,

    private readonly notificationsService: NotificationsService,
  ) {}

  // Create task in project
  async createTask(
    slug: string,
    projectId: string,
    dto: CreateTaskDto,
    currentUserId: string,
  ): Promise<TaskDetail> {
    const { workspace, project } = await this.validateProjectAccess(
      slug,
      projectId,
      currentUserId,
    );

    const lastPosition = await this.taskRepository.findLastPosition(project.id);

    let assigneeId: string | undefined;

    if (dto.assigneeId) {
      const assignee = await this.userRepository.findById(dto.assigneeId);

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      await this.workspaceAccessService.validateUserInWorkspace(
        workspace.id,
        assignee.id,
      );

      assigneeId = assignee.id;
    }

    const task = await this.taskRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,

      position: lastPosition + 1,

      project: {
        connect: {
          id: project.id,
        },
      },

      createdBy: {
        connect: {
          id: currentUserId,
        },
      },

      ...(assigneeId && {
        assignee: {
          connect: {
            id: assigneeId,
          },
        },
      }),
    });

    await this.activitiesService.createActivity(
      task.id,
      currentUserId,
      ActivityType.TASK_CREATED,
    );

    if (task.assigneeId && task.assigneeId !== currentUserId) {
      await this.notificationsService.createNotification({
        userId: task.assigneeId,
        type: NotificationType.TASK_ASSIGNED,
        message: `You have been assigned to task "${task.title}"`,
        payload: {
          taskId: task.id,
          projectId,
          workspaceSlug: slug,
        },
      });
    }

    return task;
  }

  // Get all activities
  async getActivities(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ) {
    const { task } = await this.validateTaskAccess(
      slug,
      projectId,
      taskId,
      currentUserId,
    );

    return this.activitiesService.getActivitiesByTaskId(task.id);
  }

  // Get all task in project
  async getAllTasks(
    slug: string,
    projectId: string,
    currentUserId: string,
  ): Promise<TaskList> {
    const { project } = await this.validateProjectAccess(
      slug,
      projectId,
      currentUserId,
    );

    return this.taskRepository.findAllByProjectId(project.id);
  }

  // get task by ID
  async getTaskById(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ): Promise<TaskDetail | null> {
    const { task } = await this.validateTaskAccess(
      slug,
      projectId,
      taskId,
      currentUserId,
    );

    return task;
  }

  // Update task
  async updateTask(
    slug: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
    currentUserId: string,
  ) {
    const { workspace, task } = await this.validateTaskAccess(
      slug,
      projectId,
      taskId,
      currentUserId,
    );

    // Only workspace owner or task assignee can update task
    if (
      workspace.ownerId !== currentUserId &&
      task.assigneeId !== currentUserId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }

    const isStatusChanged =
      dto.status !== undefined && dto.status !== task.status;

    const isAssigneeChanged =
      dto.assigneeId !== undefined && dto.assigneeId !== task.assigneeId;

    const hasGeneralUpdate =
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.priority !== undefined ||
      dto.dueDate !== undefined;

    let assigneeUpdate: Prisma.TaskUpdateInput = {};
    let newAssigneeId: string | null = null;

    // Unassign
    if (dto.assigneeId === null) {
      assigneeUpdate = {
        assignee: {
          disconnect: true,
        },
      };
    }

    // Assign
    else if (dto.assigneeId) {
      const assignee = await this.userRepository.findById(dto.assigneeId);

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      await this.workspaceAccessService.validateUserInWorkspace(
        workspace.id,
        assignee.id,
      );

      newAssigneeId = assignee.id;

      assigneeUpdate = {
        assignee: {
          connect: {
            id: assignee.id,
          },
        },
      };
    }

    const updatedTask = await this.taskRepository.update(task.id, {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate:
        dto.dueDate !== undefined
          ? dto.dueDate
            ? new Date(dto.dueDate)
            : null
          : undefined,
      ...assigneeUpdate,
    });

    // Status changed
    if (isStatusChanged) {
      await this.activitiesService.createActivity(
        task.id,
        currentUserId,
        ActivityType.STATUS_CHANGED,
      );

      if (updatedTask.assigneeId && updatedTask.assigneeId !== currentUserId) {
        await this.notificationsService.createNotification({
          userId: updatedTask.assigneeId,
          type: NotificationType.STATUS_CHANGED,
          message: `Task "${updatedTask.title}" status changed to ${updatedTask.status}`,
          payload: {
            taskId: task.id,
            projectId,
            workspaceSlug: slug,
            status: updatedTask.status,
          },
        });
      }
    }

    // Assignee changed
    if (isAssigneeChanged) {
      await this.activitiesService.createActivity(
        task.id,
        currentUserId,
        ActivityType.TASK_ASSIGNED,
      );

      if (newAssigneeId && newAssigneeId !== currentUserId) {
        await this.notificationsService.createNotification({
          userId: newAssigneeId,
          type: NotificationType.TASK_ASSIGNED,
          message: `You have been assigned to task "${updatedTask.title}"`,
          payload: {
            taskId: task.id,
            projectId,
            workspaceSlug: slug,
          },
        });
      }
    }

    // General task update
    if (hasGeneralUpdate) {
      await this.activitiesService.createActivity(
        task.id,
        currentUserId,
        ActivityType.TASK_UPDATED,
      );
    }

    return updatedTask;
  }

  // Delete task
  async deleteTask(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ): Promise<TaskDetail> {
    const { workspace, task } = await this.validateTaskAccess(
      slug,
      projectId,
      taskId,
      currentUserId,
    );

    if (workspace.ownerId !== currentUserId) {
      throw new ForbiddenException('Only workspace owner can delete task');
    }

    return this.taskRepository.delete(task.id);
  }

  // Helper function for validate task access
  private async validateTaskAccess(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ) {
    const { workspace, project } = await this.validateProjectAccess(
      slug,
      projectId,
      currentUserId,
    );

    const task = await this.taskRepository.findByProjectAndId(
      project.id,
      taskId,
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return { workspace, project, task };
  }

  // Helper function for validate task access
  private async validateProjectAccess(
    slug: string,
    projectId: string,
    currentUserId: string,
  ) {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceAccess(
        slug,
        currentUserId,
      );

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspaceId !== workspace.id) {
      throw new BadRequestException('Project does not belong to workspace');
    }

    return { workspace, project };
  }
}
