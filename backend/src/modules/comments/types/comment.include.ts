import { Prisma } from "@prisma/client";

export const commentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.CommentInclude;