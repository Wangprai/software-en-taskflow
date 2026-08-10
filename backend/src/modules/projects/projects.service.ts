import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectInterface } from './interfaces/project.interface.abstract';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { ProjectDetail, ProjectList } from './types/project.type';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectInterface)
    private readonly projectRepository: ProjectInterface,

    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  // Create project in workspace
  async createProject(
    slug: string,
    dto: CreateProjectDto,
    currentUserId: string,
  ): Promise<ProjectDetail> {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceAccess(
        slug,
        currentUserId,
      );

    return this.projectRepository.create({
      name: dto.name,
      description: dto.description,

      owner: {
        connect: {
          id: currentUserId,
        },
      },

      workspace: {
        connect: {
          id: workspace.id,
        },
      },
    });
  }

  // get all projects
  async getProjects(slug: string, currentUserId: string): Promise<ProjectList> {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceAccess(
        slug,
        currentUserId,
      );

    return this.projectRepository.findAllByWorkspaceId(workspace.id);
  }

  // get project detail
  async getProjectById(slug: string, projectId: string, currentUserId: string): Promise<ProjectDetail> {
    const { project } = await this.validateProjectAccess(
      slug,
      projectId,
      currentUserId,
    );

    return project;
  }

  // Update project
  async updateProject(
    slug: string,
    projectId: string,
    dto: UpdateProjectDto,
    currentUserId: string,
  ): Promise<ProjectDetail> {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceOwner(
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

    return this.projectRepository.update(projectId, {
      name: dto.name,
      description: dto.description,
    });
  }

  // Delete project
  async deleteProject(
    slug: string,
    projectId: string,
    currentUserId: string,
  ): Promise<ProjectDetail> {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceOwner(
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

    return this.projectRepository.delete(projectId);
  }

  // Helper function for validate project access
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

    return {
      workspace,
      project,
    };
  }
}
