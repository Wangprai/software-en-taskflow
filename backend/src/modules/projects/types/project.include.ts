import { Prisma } from '@prisma/client';

export const projectInclude = {
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  workspace: true,
  _count: {
    select: {
      tasks: true,
    },
  },
} satisfies Prisma.ProjectInclude;