import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskInterface } from './interfaces/task.interface.abstract';
import { ProjectInterface } from '../projects/interfaces/project.interface.abstract';
import { WorkspaceInterface } from '../workspaces/interfaces/workspace.interface.abstract';
import { UserInterface } from '../users/interfaces/user.interface.abstract';
import { WorkspaceMemberInterface } from '../workspace-members/interfaces/workspace-member.interface.abstract';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TaskInterface)
    private readonly taskRepository: TaskInterface,

    @Inject(ProjectInterface)
    private readonly projectRepository: ProjectInterface,

    @Inject(WorkspaceInterface)
    private readonly workspaceRepository: WorkspaceInterface,

    @Inject(WorkspaceMemberInterface)
    private readonly workspaceMemberRepository: WorkspaceMemberInterface,

    @Inject(UserInterface)
    private readonly userRepository: UserInterface,
  ) {}

  // Create task in project
  async createTask(
    slug: string,
    projectId: string,
    dto: CreateTaskDto,
    currentUserId: string,
  ) {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = workspace.ownerId === currentUserId;

    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(
      workspace.id,
      currentUserId,
    );

    if (!isOwner && !member) {
      throw new ForbiddenException('Access denied');
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspaceId !== workspace.id) {
      throw new BadRequestException('Project does not belong to workspace');
    }

    const lastPosition = await this.taskRepository.findLastPosition(project.id);

    let assigneeId: string | undefined;

    if (dto.assigneeId) {
      const assignee = await this.userRepository.findById(dto.assigneeId);

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      const assigneeMember =
        await this.workspaceMemberRepository.findByWorkspaceAndUser(
          workspace.id,
          assignee.id,
        );

      const isWorkspaceOwner = workspace.ownerId === assignee.id;

      if (!assigneeMember && !isWorkspaceOwner) {
        throw new BadRequestException('Assignee is not a workspace member');
      }

      assigneeId = assignee.id;
    }

    return this.taskRepository.create({
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
  }

  // Get all task in project
  async getAllTasks(slug: string, projectId: string, currentUserId: string) {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = workspace.ownerId === currentUserId;

    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(
      workspace.id,
      currentUserId,
    );

    if (!isOwner && !member) {
      throw new ForbiddenException('Access denied');
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspaceId !== workspace.id) {
      throw new BadRequestException('Project does not belong to workspace');
    }

    return this.taskRepository.findAllByProjectId(project.id);
  }

  // get task by ID
  async getTaskById(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ) {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = workspace.ownerId === currentUserId;

    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(
      workspace.id,
      currentUserId,
    );

    if (!isOwner && !member) {
      throw new ForbiddenException('Access denied');
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspaceId !== workspace.id) {
      throw new BadRequestException('Project does not belong to workspace');
    }

    const task = await this.taskRepository.findByProjectAndId(
      project.id,
      taskId,
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

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
    const task = await this.getTaskById(slug, projectId, taskId, currentUserId);

    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Only workspace owner or task assignee can update task
    if (
      workspace.ownerId !== currentUserId &&
      task.assigneeId !== currentUserId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }

    let assigneeUpdate = {};

    // Unassign task
    if (dto.assigneeId === null) {
      assigneeUpdate = {
        assignee: {
          disconnect: true,
        },
      };
    }

    // Assign task
    else if (dto.assigneeId) {
      const assignee = await this.userRepository.findById(dto.assigneeId);

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      const assigneeMember =
        await this.workspaceMemberRepository.findByWorkspaceAndUser(
          workspace.id,
          assignee.id,
        );

      const isWorkspaceOwner = workspace.ownerId === assignee.id;

      if (!assigneeMember && !isWorkspaceOwner) {
        throw new BadRequestException('Assignee is not a workspace member');
      }

      assigneeUpdate = {
        assignee: {
          connect: {
            id: assignee.id,
          },
        },
      };
    }

    return this.taskRepository.update(task.id, {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      ...assigneeUpdate,
    });
  }

  // Delete task
  async deleteTask(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ) {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== currentUserId) {
      throw new ForbiddenException('Only workspace owner can delete task');
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspaceId !== workspace.id) {
      throw new BadRequestException('Project does not belong to workspace');
    }

    const task = await this.taskRepository.findByProjectAndId(
      project.id,
      taskId,
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.delete(task.id);
  }
}
