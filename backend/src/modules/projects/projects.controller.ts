import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('workspaces/:slug/projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Endpoint to create project in workspace
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createProject(
    @Param('slug') slug: string,
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.createProject(slug, dto, user.id);
  }

  // Endpoint to get all projects in workspaces
  @Get()
  async getProjects(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.getProjects(slug, user.id);
  }

  // Endpoint to get project detail
  @Get(':projectId')
  async getProjectById(
    @Param('slug') slug: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.getProjectById(slug, projectId, user.id);
  }

  // Endpoint to update project
  @Patch(':projectId')
  async updateProject(
    @Param('slug') slug: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.updateProject(slug, projectId, dto, user.id);
  }

  // Endpoint to delete project
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':projectId')
  async deleteProject(
    @Param('slug') slug: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.projectsService.deleteProject(slug, projectId, user.id);
  }
}
