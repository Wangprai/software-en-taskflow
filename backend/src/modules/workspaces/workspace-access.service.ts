import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WorkspaceInterface } from './interfaces/workspace.interface.abstract';

@Injectable()
export class WorkspaceAccessService {
  constructor(
    @Inject(WorkspaceInterface)
    private readonly workspaceRepository: WorkspaceInterface,
  ) {}

  // Validate workspace access by slug
  async validateWorkspaceAccess(slug: string, userId: string) {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = workspace.ownerId === userId;

    const isMember = workspace.members?.some(
      (member) => member.userId === userId,
    );

    if (!isOwner && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    return { workspace, isOwner };
  }

  // Validate workspace owner
  async validateWorkspaceOwner(slug: string, userId: string) {
    const result = await this.validateWorkspaceAccess(slug, userId);

    if (!result.isOwner) {
      throw new ForbiddenException(
        'Only workspace owner can perform this action',
      );
    }

    return result;
  }

  // Validate user access to workspace by workspace ID
  async validateUserInWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = workspace.ownerId === userId;

    const isMember = workspace.members?.some(
      (member) => member.userId === userId,
    );

    if (!isOwner && !isMember) {
      throw new ForbiddenException('User is not a member of workspace');
    }

    return { workspace, isOwner };
  }
}
