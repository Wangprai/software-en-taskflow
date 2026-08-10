import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceInterface } from './interfaces/workspace.interface.abstract';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Prisma } from '@prisma/client';
import {
  WorkspaceDetail,
  WorkspaceListItem,
  WorkspacePayload,
} from './types/workspace.type';
import { GenerateSlugService } from './generate-slug.service';
import { WorkspaceAccessService } from './workspace-access.service';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly workspaceRepository: WorkspaceInterface,
    private readonly generateSlugService: GenerateSlugService,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  // Create a new workspace and associate it with the user as the owner
  async createWorkspace(
    userId: string,
    dto: CreateWorkspaceDto,
  ): Promise<WorkspacePayload> {
    try {
      const slug = await this.generateSlugService.generate(dto.name);

      const workspace = await this.workspaceRepository.create({
        name: dto.name,
        slug: slug,
        description: dto.description,
        // Connect the owner and create a member with ADMIN role
        owner: { connect: { id: userId } },
        // Create a member with ADMIN role for the owner
        members: {
          create: {
            userId: userId,
            role: 'ADMIN',
          },
        },
      });

      return workspace;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2002') {
          throw new ConflictException('Workspace slug already exists');
        }
      throw new InternalServerErrorException('Failed to create workspace');
    }
  }

  // Retrieve all workspaces associated with a specific user
  async findMyWorkspaces(userId: string): Promise<WorkspaceListItem[]> {
    return this.workspaceRepository.findAllByUserId(userId);
  }

  // Find a workspace by its slug and ensure the user has access to it
  async findWorkspaceBySlug(
    slug: string,
    userId: string,
  ): Promise<WorkspaceDetail> {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceAccess(slug, userId);

    return workspace;
  }

  // Update a workspace by ID, ensuring that only the owner can perform this action
  async updateWorkspace(
    id: string,
    userId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDetail> {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new NotFoundException(`Workspace not found`);
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the workspace owner can perform this action',
      );
    }

    try {
      return await this.workspaceRepository.update(id, dto);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2002') {
          throw new ConflictException('Workspace slug already exists');
        }
      throw new InternalServerErrorException('Failed to update workspace');
    }
  }

  // Delete a workspace by ID, ensuring that only the owner can perform this action
  async deleteWorkspace(id: string, userId: string): Promise<WorkspaceDetail> {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the workspace owner can perform this action',
      );
    }

    try {
      return await this.workspaceRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new BadRequestException(
            'Cannot delete workspace with existing projects',
          );
        }

      throw error;
    }
  }
}
