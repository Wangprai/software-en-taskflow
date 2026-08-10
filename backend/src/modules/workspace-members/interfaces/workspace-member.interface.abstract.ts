import { MemberRole } from '@prisma/client';
import {
  WorkspaceMemberList,
  WorkspaceMemberWithUser,
} from '../types/workspace-member.type';

export abstract class WorkspaceMemberInterface {
  abstract create(
    workspaceId: string,
    userId: string,
    role: MemberRole,
  ): Promise<WorkspaceMemberWithUser>;

  abstract findById(id: string): Promise<WorkspaceMemberWithUser | null>;

  abstract findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberWithUser | null>;

  abstract findAllByWorkspaceId(
    workspaceId: string,
  ): Promise<WorkspaceMemberList>;

  abstract delete(id: string): Promise<WorkspaceMemberWithUser>;
}
