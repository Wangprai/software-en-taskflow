import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Workspace, Prisma } from '@prisma/client';
import { WorkspaceInterface } from '../interfaces/workspace.interface.abstract';
import {
  WorkspaceDetail,
  WorkspaceListItem,
  WorkspacePayload,
  WorkspaceWithMembers,
} from '../types/workspace.type';

@Injectable()
export class WorkspaceRepository implements WorkspaceInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new workspace in the database
  async create(data: Prisma.WorkspaceCreateInput): Promise<WorkspacePayload> {
    return this.prisma.workspace.create({
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: true,
      },
    });
  }

  // Find all workspaces associated with a specific user
  async findAllByUserId(userId: string): Promise<WorkspaceListItem[]> {
    return this.prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, projects: true } }, // Include the count of members and projects in the workspace
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Find a workspace by ID associated with a specific user
  async findById(id: string): Promise<WorkspaceWithMembers | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        members: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });
  }

  // Find a workspace by slug, including its owner, members, and projects
  async findBySlug(
    slug: string,
  ): Promise<WorkspaceDetail | null> {
    return this.prisma.workspace.findUnique({
      where: {
        slug,
      },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        members: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
        projects: true,
      },
    });
  }

  // Update a workspace by ID
  async update(
    id: string,
    data: Prisma.WorkspaceUpdateInput,
  ): Promise<Workspace> {
    return this.prisma.workspace.update({ where: { id }, data });
  }

  // Delete a workspace by ID
  async delete(id: string): Promise<Workspace> {
    return this.prisma.workspace.delete({ where: { id } });
  }
}
