import { Prisma } from "@prisma/client";

export const taskInclude = {
  project: true,
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.TaskInclude;
