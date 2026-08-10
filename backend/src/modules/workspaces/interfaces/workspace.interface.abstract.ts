import { Prisma } from '@prisma/client';
import {
  WorkspaceDetail,
  WorkspaceListItem,
  WorkspacePayload,
  WorkspaceWithMembers,
} from '../types/workspace.type';

// Defines an abstract class for workspace interface operations
export abstract class WorkspaceInterface {
  abstract create(data: Prisma.WorkspaceCreateInput): Promise<WorkspacePayload>;

  abstract findAllByUserId(userId: string): Promise<WorkspaceListItem[]>;

  abstract findById(id: string): Promise<WorkspaceWithMembers | null>;

  abstract findBySlug(slug: string): Promise<WorkspaceDetail | null>;

  abstract update(
    id: string,
    data: Prisma.WorkspaceUpdateInput,
  ): Promise<WorkspaceDetail>;

  abstract delete(id: string): Promise<WorkspaceDetail>;
}
