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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('workspaces/:slug/projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Endpoint to create task
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createTask(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.createTask(slug, projectId, dto, user.id);
  }

  // Endpoint to get all tasks
  @Get()
  async getAllTasks(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.getAllTasks(slug, projectId, user.id);
  }

  // Endpoint to get task detail
  @Get(':taskId')
  async getTaskById(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.getTaskById(slug, projectId, taskId, user.id);
  }

  // Endpoint to update task
  @HttpCode(HttpStatus.OK)
  @Patch(':taskId')
  async updateTask(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.updateTask(slug, projectId, taskId, dto, user.id);
  }

  // Endpoint to delete task
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':taskId')
  async deleteTask(
    @Param('slug') slug: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.tasksService.deleteTask(slug, projectId, taskId, user.id);
  }
}
