import { Prisma } from '@prisma/client';
import { projectInclude } from './project.include';

export type ProjectWithCount = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

export type ProjectDetail = Omit<ProjectWithCount, "_count"> & {
  taskCount: number;
};

export type ProjectList = ProjectDetail[];
