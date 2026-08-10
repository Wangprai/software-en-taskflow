import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
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

  // Find all workspaces associated with a specific user
  async findAllByUserId(userId: string): Promise<WorkspaceListItem[]> {
    return this.prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: workspaceListItemInclude,
    });
  }

  // Find a workspace by ID associated with a specific user
  async findById(id: string): Promise<WorkspaceWithMembers | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      include: workspaceWithMembersInclude,
    });
  }

  // Find a workspace by slug, including its owner, members, and projects
  async findBySlug(slug: string): Promise<WorkspaceDetail | null> {
    return this.prisma.workspace.findUnique({
      where: {
        slug,
      },
      include: workspaceDetailInclude,
    });
  }

  // Update a workspace by ID
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

  // Delete a workspace by ID
  async delete(id: string): Promise<WorkspaceDetail> {
    return this.prisma.workspace.delete({
      where: { id },
      include: workspaceDetailInclude,
    });
  }
}
