import { Prisma } from '@prisma/client';

export type WorkspaceDetail = Prisma.WorkspaceGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        email: true;
        name: true;
      };
    };
    members: {
      include: {
        user: {
          select: {
            id: true;
            email: true;
            name: true;
          };
        };
      };
    };
    projects: true;
  };
}>;

export type WorkspaceListItem = Prisma.WorkspaceGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    _count: {
      select: {
        members: true;
        projects: true;
      };
    };
  };
}>;

export type WorkspaceWithMembers = Prisma.WorkspaceGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        email: true;
        name: true;
      };
    };
    members: {
      include: {
        user: {
          select: {
            id: true;
            email: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type WorkspacePayload = Prisma.WorkspaceGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    members: true;
  };
}>;
