import { Prisma } from '@prisma/client';

export const workspaceDetailInclude = {
  owner: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  },
  projects: true,
} satisfies Prisma.WorkspaceInclude;

export const workspaceListItemInclude = {
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      members: true,
      projects: true,
    },
  },
} satisfies Prisma.WorkspaceInclude;

export const workspaceWithMembersInclude = {
  owner: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.WorkspaceInclude;

export const workspacePayloadInclude = {
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  members: true,
} satisfies Prisma.WorkspaceInclude;