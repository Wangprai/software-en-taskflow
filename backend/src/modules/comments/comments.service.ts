import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentInterface } from './interfaces/comment.interface.abstract';
import { TaskInterface } from '../tasks/interfaces/task.interface.abstract';
import { WorkspaceInterface } from '../workspaces/interfaces/workspace.interface.abstract';
import { WorkspaceMemberInterface } from '../workspace-members/interfaces/workspace-member.interface.abstract';
import { ProjectInterface } from '../projects/interfaces/project.interface.abstract';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentDetail, CommentList } from './types/comment.type';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(CommentInterface)
    private readonly commentRepository: CommentInterface,

    @Inject(TaskInterface)
    private readonly taskRepository: TaskInterface,

    @Inject(WorkspaceInterface)
    private readonly workspaceRepository: WorkspaceInterface,

    @Inject(WorkspaceMemberInterface)
    private readonly workspaceMemberRepository: WorkspaceMemberInterface,

    @Inject(ProjectInterface)
    private readonly projectRepository: ProjectInterface,
  ) {}

  // Create comment on task
  async createComment(
    slug: string,
    projectId: string,
    taskId: string,
    dto: CreateCommentDto,
    currentUserId: string,
  ): Promise<CommentDetail> {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    return this.commentRepository.create({
      content: dto.content,

      task: {
        connect: {
          id: taskId,
        },
      },

      user: {
        connect: {
          id: currentUserId,
        },
      },
    });
  }

  // Get all comments from task
  async getAllComments(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ): Promise<CommentList> {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    return this.commentRepository.findAllByTaskId(taskId);
  }

  // Get comment detail
  async getCommentById(
    slug: string,
    projectId: string,
    taskId: string,
    commentId: string,
    currentUserId: string,
  ): Promise<CommentDetail> {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    const comment = await this.commentRepository.findByTaskAndId(
      taskId,
      commentId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  // Update own comment
  async updateComment(
    slug: string,
    projectId: string,
    taskId: string,
    commentId: string,
    dto: UpdateCommentDto,
    currentUserId: string,
  ): Promise<CommentDetail> {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    const comment = await this.commentRepository.findByTaskAndId(
      taskId,
      commentId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own comment');
    }

    return this.commentRepository.update(comment.id, {
      content: dto.content,
    });
  }

  // Delete own comment
  async deleteComment(
    slug: string,
    projectId: string,
    taskId: string,
    commentId: string,
    currentUserId: string,
  ): Promise<void> {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    const comment = await this.commentRepository.findByTaskAndId(
      taskId,
      commentId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    await this.commentRepository.delete(comment.id);
  }

  // Validate workspace, project, member and task access
  private async validateTaskAccess(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ) {
    // 1. Find workspace
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // 2. Check workspace access
    const isOwner = workspace.ownerId === currentUserId;

    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(
      workspace.id,
      currentUserId,
    );

    if (!isOwner && !member) {
      throw new ForbiddenException('Access denied');
    }

    // 3. Find project
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 4. Make sure project belongs to workspace
    if (project.workspaceId !== workspace.id) {
      throw new BadRequestException('Project does not belong to workspace');
    }

    // 5. Find task inside this project
    const task = await this.taskRepository.findByProjectAndId(
      project.id,
      taskId,
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}
