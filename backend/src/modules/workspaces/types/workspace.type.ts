import { Prisma } from '@prisma/client';
import {
  workspaceDetailInclude,
  workspaceListItemInclude,
  workspacePayloadInclude,
  workspaceWithMembersInclude,
} from './workspace.include';

export type WorkspaceDetail = Prisma.WorkspaceGetPayload<{
  include: typeof workspaceDetailInclude;
}>;

type WorkspaceListItemPayload = Prisma.WorkspaceGetPayload<{
  include: typeof workspaceListItemInclude;
}>;

export type WorkspaceListItem = Omit<
  WorkspaceListItemPayload,
  '_count'
> & {
  memberCount: number;
  projectCount: number;
};

export type WorkspaceWithMembers = Prisma.WorkspaceGetPayload<{
  include: typeof workspaceWithMembersInclude;
}>;

export type WorkspacePayload = Prisma.WorkspaceGetPayload<{
  include: typeof workspacePayloadInclude;
}>;
