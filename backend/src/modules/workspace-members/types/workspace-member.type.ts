import { Prisma } from '@prisma/client';
import { workspaceMemberWithUserInclude } from './workspace-member.include';

export type WorkspaceMemberWithUser = Prisma.WorkspaceMemberGetPayload<{
  include: typeof workspaceMemberWithUserInclude;
}>;

export type WorkspaceMemberList = WorkspaceMemberWithUser[];
