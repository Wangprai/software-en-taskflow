import { Injectable } from '@nestjs/common';
import { ProjectInterface } from '../interfaces/project.interface.abstract';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ProjectDetail,
  ProjectList,
  ProjectWithCount,
} from '../types/project.type';
import { Prisma } from '@prisma/client';
import { projectInclude } from '../types/project.include';

@Injectable()
export class ProjectRepository implements ProjectInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new project
  async create(data: Prisma.ProjectCreateInput): Promise<ProjectDetail> {
    const project = await this.prisma.project.create({
      data,
      include: projectInclude,
    });

    return this.toProjectDetail(project);
  }

  // Find all projects in a workspace
  async findAllByWorkspaceId(workspaceId: string): Promise<ProjectList> {
    const projects = await this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: projectInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects.map((project) => this.toProjectDetail(project));
  }

  // Find a project by ID
  async findById(id: string): Promise<ProjectDetail | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });

    return project ? this.toProjectDetail(project) : null;
  }

  // Update a project
  async update(
    id: string,
    data: Prisma.ProjectUpdateInput,
  ): Promise<ProjectDetail> {
    const project = await this.prisma.project.update({
      where: {
        id,
      },
      data,
      include: projectInclude,
    });

    return this.toProjectDetail(project);
  }

  // Delete a project
  async delete(id: string): Promise<ProjectDetail> {
    const project = await this.prisma.project.delete({
      where: {
        id,
      },
      include: projectInclude,
    });

    return this.toProjectDetail(project);
  }

  private toProjectDetail(project: ProjectWithCount): ProjectDetail {
    const { _count, ...data } = project;

    return {
      ...data,
      taskCount: _count.tasks,
    };
  }
}
