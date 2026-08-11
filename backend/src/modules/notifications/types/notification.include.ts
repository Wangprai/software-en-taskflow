import { Prisma } from "@prisma/client";

export const notificationInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.NotificationInclude;