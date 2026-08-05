import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectInterface } from './interfaces/project.interface.abstract';
import { WorkspaceInterface } from '../workspaces/interfaces/workspace.interface.abstract';
import { WorkspaceMemberInterface } from '../workspace-members/interfaces/workspace-member.interface.abstract';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectInterface)
    private readonly projectRepository: ProjectInterface,

    @Inject(WorkspaceInterface)
    private readonly workspaceRepository: WorkspaceInterface,

    @Inject(WorkspaceMemberInterface)
    private readonly workspaceMemberRepository: WorkspaceMemberInterface,
  ) {}

  // Create project in workspace
  async createProject(
    slug: string,
    dto: CreateProjectDto,
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
  async getProjects(slug: string, currentUserId: string) {
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

    return this.projectRepository.findAllByWorkspaceId(workspace.id);
  }

  // get project detail
  async getProjectById(slug: string, projectId: string, currentUserId: string) {
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

    return project;
  }

  // Update project 
  async updateProject(
    slug: string,
    projectId: string,
    dto: UpdateProjectDto,
    currentUserId: string,
  ) {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== currentUserId) {
      throw new ForbiddenException('Only workspace owner can update project');
    }

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
  async deleteProject(slug: string, projectId: string, currentUserId: string) {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== currentUserId) {
      throw new ForbiddenException('Only workspace owner can delete project');
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspaceId !== workspace.id) {
      throw new BadRequestException('Project does not belong to workspace');
    }

    return this.projectRepository.delete(projectId);
  }
}
