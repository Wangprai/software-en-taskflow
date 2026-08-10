import { Injectable } from '@nestjs/common';
import { ProjectInterface } from '../interfaces/project.interface.abstract';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProjectDetail, ProjectList } from '../types/project.type';
import { Prisma } from '@prisma/client';
import { projectInclude } from '../types/project.include';

@Injectable()
export class ProjectRepository implements ProjectInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new project
  async create(data: Prisma.ProjectCreateInput): Promise<ProjectDetail> {
    return this.prisma.project.create({
      data,
      include: projectInclude,
    });
  }

  // Find all projects in a workspace
  async findAllByWorkspaceId(workspaceId: string): Promise<ProjectList> {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: projectInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Find a project by ID
  async findById(id: string): Promise<ProjectDetail | null> {
    return this.prisma.project.findUnique({
      where: {
        id,
      },
      include: projectInclude,
    });
  }

  // Update a project
  async update(
    id: string,
    data: Prisma.ProjectUpdateInput,
  ): Promise<ProjectDetail> {
    return this.prisma.project.update({
      where: {
        id,
      },
      data,
      include: projectInclude,
    });
  }

  // Delete a project
  async delete(id: string): Promise<ProjectDetail> {
    return this.prisma.project.delete({
      where: {
        id,
      },
      include: projectInclude,
    });
  }
}
