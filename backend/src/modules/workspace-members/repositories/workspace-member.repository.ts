import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WorkspaceMemberInterface } from '../interfaces/workspace-member.interface.abstract';
import { MemberRole } from '@prisma/client';
import {
  WorkspaceMemberList,
  WorkspaceMemberWithUser,
} from '../types/workspace-member.type';

@Injectable()
export class WorkspaceMemberRepository implements WorkspaceMemberInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create new member
  async create(
    workspaceId: string,
    userId: string,
    role: MemberRole,
  ): Promise<WorkspaceMemberWithUser> {
    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Find member in workspace
  async findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberWithUser | null> {
    return this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Find member by id
  async findById(id: string): Promise<WorkspaceMemberWithUser | null> {
    return this.prisma.workspaceMember.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Get all members in workspace
  async findAllByWorkspaceId(
    workspaceId: string,
  ): Promise<WorkspaceMemberList> {
    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        role: 'asc',
      },
    });
  }

  // Delete member
  async delete(id: string): Promise<WorkspaceMemberWithUser> {
    return this.prisma.workspaceMember.delete({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
