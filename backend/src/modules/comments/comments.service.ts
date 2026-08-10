import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentInterface } from './interfaces/comment.interface.abstract';
import { TaskInterface } from '../tasks/interfaces/task.interface.abstract';
import { ProjectInterface } from '../projects/interfaces/project.interface.abstract';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(CommentInterface)
    private readonly commentRepository: CommentInterface,

    @Inject(TaskInterface)
    private readonly taskRepository: TaskInterface,

    @Inject(ProjectInterface)
    private readonly projectRepository: ProjectInterface,

    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  // Create comment
  async createComment(
    slug: string,
    projectId: string,
    taskId: string,
    dto: CreateCommentDto,
    currentUserId: string,
  ) {
    const { task } = await this.validateTaskAccess(
      slug,
      projectId,
      taskId,
      currentUserId,
    );

    return this.commentRepository.create({
      content: dto.content,
      task: { connect: { id: task.id } },
      user: { connect: { id: currentUserId } },
    });
  }

  // Get all comments from task
  async getComments(
    slug: string,
    projectId: string,
    taskId: string,
    currentUserId: string,
  ) {
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
  ) {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    return this.validateComment(taskId, commentId);
  }

  // Update own comment
  async updateComment(
    slug: string,
    projectId: string,
    taskId: string,
    commentId: string,
    dto: UpdateCommentDto,
    currentUserId: string,
  ) {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    const comment = await this.validateComment(taskId, commentId);

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
  ) {
    await this.validateTaskAccess(slug, projectId, taskId, currentUserId);

    const comment = await this.validateComment(taskId, commentId);

    if (comment.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    return this.commentRepository.delete(comment.id);
  }

  // Helper function for validate workspace, project, member and task access private
  private async validateTaskAccess(
    slug: string,
    projectId: string,
    taskId: string,
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

    const task = await this.taskRepository.findByProjectAndId(
      project.id,
      taskId,
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return { workspace, project, task };
  }

  // Helper for validate comment
  private async validateComment(taskId: string, commentId: string) {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.taskId !== taskId) {
      throw new BadRequestException('Comment does not belong to task');
    }

    return comment;
  }
}
