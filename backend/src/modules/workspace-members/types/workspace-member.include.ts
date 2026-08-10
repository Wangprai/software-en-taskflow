import { Prisma } from '@prisma/client';

export const workspaceMemberWithUserInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.WorkspaceMemberInclude;