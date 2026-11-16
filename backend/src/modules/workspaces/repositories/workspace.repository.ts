import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MemberRole, Prisma } from '@prisma/client';
import { WorkspaceInterface } from '../interfaces/workspace.interface.abstract';
import {
  WorkspaceDetail,
  WorkspaceListItem,
  WorkspacePayload,
  WorkspaceWithMembers,
} from '../types/workspace.type';
import {
  workspaceDetailInclude,
  workspaceListItemInclude,
  workspacePayloadInclude,
  workspaceWithMembersInclude,
} from '../types/workspace.include';

@Injectable()
export class WorkspaceRepository implements WorkspaceInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new workspace in the database
  async create(data: Prisma.WorkspaceCreateInput): Promise<WorkspacePayload> {
    return this.prisma.workspace.create({
      data,
      include: workspacePayloadInclude,
    });
  }

  // Find all workspaces associated with a user
  async findAllByUserId(userId: string): Promise<WorkspaceListItem[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: workspaceListItemInclude,
    });

    return workspaces.map((workspace) => ({
      ...workspace,
      memberCount: workspace._count.members,
      projectCount: workspace._count.projects,
    }));
  }

  // Find a workspace by ID
  async findById(id: string): Promise<WorkspaceWithMembers | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      include: workspaceWithMembersInclude,
    });
  }

  // Find a workspace by slug
  async findBySlug(slug: string): Promise<WorkspaceDetail | null> {
    return this.prisma.workspace.findUnique({
      where: {
        slug,
      },
      include: workspaceDetailInclude,
    });
  }

  // Transfer Workspace Ownership
  async transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    newOwnerId: string,
    shouldLeave: boolean,
  ): Promise<WorkspaceDetail> {
    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.findFirst({
        where: {
          id: workspaceId,
          ownerId: currentOwnerId,
        },
      });

      if (!workspace) {
        throw new ConflictException(
          'Workspace ownership has changed or workspace not found',
        );
      }

      const newOwnerMember = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: newOwnerId,
          },
        },
      });

      if (newOwnerId === currentOwnerId) {
        throw new BadRequestException('Cannot transfer ownership to yourself');
      }

      if (!newOwnerMember) {
        throw new BadRequestException(
          'New owner must be an existing workspace member',
        );
      }

      await tx.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          ownerId: newOwnerId,
        },
      });

      const result = shouldLeave
        ? await tx.workspaceMember.deleteMany({
            where: {
              workspaceId,
              userId: currentOwnerId,
            },
          })
        : await tx.workspaceMember.updateMany({
            where: {
              workspaceId,
              userId: currentOwnerId,
            },
            data: {
              role: MemberRole.MEMBER,
            },
          });

      if (result.count !== 1) {
        throw new ConflictException(
          'Workspace owner membership is inconsistent',
        );
      }

      return tx.workspace.findUniqueOrThrow({
        where: {
          id: workspaceId,
        },
        include: workspaceDetailInclude,
      });
    });
  }

  // Update a workspace
  async update(
    id: string,
    data: Prisma.WorkspaceUpdateInput,
  ): Promise<WorkspaceDetail> {
    return this.prisma.workspace.update({
      where: { id },
      data,
      include: workspaceDetailInclude,
    });
  }

  // Delete a workspace
  async delete(id: string): Promise<WorkspaceDetail> {
    return this.prisma.workspace.delete({
      where: { id },
      include: workspaceDetailInclude,
    });
  }
}
