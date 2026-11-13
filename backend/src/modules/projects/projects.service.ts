import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectInterface } from './interfaces/project.interface.abstract';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { ProjectDetail, ProjectList } from './types/project.type';
import { ActivitiesService } from '../activities/activities.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectInterface)
    private readonly projectRepository: ProjectInterface,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly activitiesService: ActivitiesService,
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

    const key = await this.generateProjectKey(workspace.id, dto.name);

    try {
      return await this.projectRepository.create({
        name: dto.name,
        key,
        description: dto.description,
        owner: {
          connect: { id: currentUserId },
        },
        workspace: {
          connect: { id: workspace.id },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const meta = error.meta as
          | {
              target?: unknown;
              driverAdapterError?: {
                cause?: {
                  constraint?: {
                    fields?: unknown;
                  };
                };
              };
            }
          | undefined;

        const target =
          meta?.target ?? meta?.driverAdapterError?.cause?.constraint?.fields;

        const fields = Array.isArray(target)
          ? target.map((field) => String(field).replace(/"/g, ''))
          : [];

        if (fields.includes('workspaceId') && fields.includes('name')) {
          throw new ConflictException(
            'Project name already exists in this workspace',
          );
        }
      }

      throw error;
    }
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
  async getProjectById(
    slug: string,
    projectId: string,
    currentUserId: string,
  ): Promise<ProjectDetail> {
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

    try {
      return await this.projectRepository.update(projectId, {
        name: dto.name,
        description: dto.description,
      });
    } catch (error) {
      const prismaError = error as {
        code?: string;
        meta?: {
          target?: unknown;
          driverAdapterError?: {
            cause?: {
              constraint?: {
                fields?: unknown;
              };
            };
          };
        };
      };

      const target =
        prismaError.meta?.target ??
        prismaError.meta?.driverAdapterError?.cause?.constraint?.fields;

      const fields = Array.isArray(target)
        ? target.map((field) => String(field).replace(/"/g, ''))
        : [];

      if (
        prismaError.code === 'P2002' &&
        fields.includes('workspaceId') &&
        fields.includes('name')
      ) {
        throw new ConflictException(
          'Project name already exists in this workspace',
        );
      }

      throw error;
    }
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

  async getProjectActivities(
    slug: string,
    projectId: string,
    currentUserId: string,
  ) {
    const { project } = await this.validateProjectAccess(
      slug,
      projectId,
      currentUserId,
    );

    return this.activitiesService.getActivitiesByProjectId(project.id);
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

  // Helper function for generate project key
  private async generateProjectKey(
    workspaceId: string,
    projectName: string,
  ): Promise<string> {
    const projects =
      await this.projectRepository.findAllByWorkspaceId(workspaceId);

    const firstWord = projectName.trim().split(/\s+/)[0];

    const baseKey =
      firstWord.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'PROJECT';

    const existingKeys = new Set(projects.map((project) => project.key));

    let key = baseKey;
    let suffix = 2;

    while (existingKeys.has(key)) {
      key = `${baseKey}-${suffix}`;
      suffix++;
    }

    return key;
  }
}
