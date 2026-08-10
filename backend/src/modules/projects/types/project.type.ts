import { Prisma } from '@prisma/client';
import { projectInclude } from './project.include';

export type ProjectDetail = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

export type ProjectList = ProjectDetail[];
