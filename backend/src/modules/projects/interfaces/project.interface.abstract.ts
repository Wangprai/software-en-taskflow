import { Prisma } from '@prisma/client';
import { ProjectDetail, ProjectList } from '../types/project.type';

export abstract class ProjectInterface {
  abstract create(data: Prisma.ProjectCreateInput): Promise<ProjectDetail>;

  abstract findAllByWorkspaceId(workspaceId: string): Promise<ProjectList>;

  abstract findById(id: string): Promise<ProjectDetail | null>;

  abstract update(
    id: string,
    data: Prisma.ProjectUpdateInput,
  ): Promise<ProjectDetail>;

  abstract delete(id: string): Promise<ProjectDetail>;
}
