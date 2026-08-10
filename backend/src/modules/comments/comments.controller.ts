import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('workspaces/:slug/projects/:projectId/tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // Endpoint to create comment
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createComment(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.createComment(
      slug,
      projectId,
      taskId,
      dto,
      user.id,
    );
  }

  // Endpoint to get all comments
  @Get()
  async getAllComments(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.getComments(slug, projectId, taskId, user.id);
  }

  // Endpoint to get comment detail
  @Get(':commentId')
  async getCommentById(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.getCommentById(
      slug,
      projectId,
      taskId,
      commentId,
      user.id,
    );
  }

  // Endpoint to update comment
  @HttpCode(HttpStatus.OK)
  @Patch(':commentId')
  async updateComment(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.updateComment(
      slug,
      projectId,
      taskId,
      commentId,
      dto,
      user.id,
    );
  }

  // Endpoint to delete comment
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.commentsService.deleteComment(
      slug,
      projectId,
      taskId,
      commentId,
      user.id,
    );
  }
}
