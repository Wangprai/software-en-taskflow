import { Prisma } from '@prisma/client';

export type WorkspaceMemberWithUser =
  Prisma.WorkspaceMemberGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          name: true;
          email: true;
        };
      };
    };
  }>;

export type WorkspaceMemberList =
  WorkspaceMemberWithUser[];