import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceMemberInterface } from './interfaces/workspace-member.interface.abstract';
import { UserInterface } from '../users/interfaces/user.interface.abstract';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { UpdateWorkspaceMemberRoleDto } from './dto/update-workspace-member.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { LeaveWorkspaceDto } from './dto/leave-workspace.dto';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @Inject(WorkspaceMemberInterface)
    private readonly workspaceMemberRepository: WorkspaceMemberInterface,

    @Inject(UserInterface)
    private readonly userRepository: UserInterface,

    private readonly workspaceAccessService: WorkspaceAccessService,

    private readonly workspacesService: WorkspacesService,
  ) {}

  // Add new member to workspace
  async addMember(
    slug: string,
    dto: CreateWorkspaceMemberDto,
    currentUserId: string,
  ) {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceManager(
        slug,
        currentUserId,
      );

    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === workspace.ownerId) {
      throw new ConflictException('Workspace owner is already the owner');
    }

    const existingMember =
      await this.workspaceMemberRepository.findByWorkspaceAndUser(
        workspace.id,
        user.id,
      );

    if (existingMember) {
      throw new ConflictException('User already joined workspace');
    }

    return this.workspaceMemberRepository.create(
      workspace.id,
      user.id,
      dto.role,
    );
  }

  // Get all members in workspace
  async getAllMembers(slug: string, currentUserId: string) {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceAccess(
        slug,
        currentUserId,
      );

    return this.workspaceMemberRepository.findAllByWorkspaceId(workspace.id);
  }

  // Leave workspace
  async leaveWorkspace(
    slug: string,
    dto: LeaveWorkspaceDto,
    currentUserId: string,
  ) {
    const { workspace, isOwner } =
      await this.workspaceAccessService.validateWorkspaceAccess(
        slug,
        currentUserId,
      );

    // Owner must transfer ownership before leaving
    if (isOwner) {
      if (!dto.newOwnerId) {
        throw new BadRequestException(
          'Workspace owner must transfer ownership before leaving',
        );
      }

      return this.workspacesService.transferOwnership(
        slug,
        dto.newOwnerId,
        currentUserId,
        true,
      );
    }

    // Admin / Member can leave directly
    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(
      workspace.id,
      currentUserId,
    );

    if (!member) {
      throw new NotFoundException('Workspace membership not found');
    }

    await this.workspaceMemberRepository.delete(member.id);
  }

  // Update role of member in workspace
  async updateMemberRole(
    slug: string,
    memberId: string,
    dto: UpdateWorkspaceMemberRoleDto,
    currentUserId: string,
  ) {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceOwner(
        slug,
        currentUserId,
      );

    const member = await this.workspaceMemberRepository.findById(memberId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.workspaceId !== workspace.id) {
      throw new BadRequestException('Member does not belong to workspace');
    }

    if (member.userId === workspace.ownerId) {
      throw new BadRequestException('Cannot change workspace owner role');
    }

    if (member.role === dto.role) {
      throw new BadRequestException('Member already has this role');
    }

    return this.workspaceMemberRepository.updateRole(memberId, dto.role);
  }

  // Delete a member in workspace by ID, ensuring that only the owner can perform this action
  async deleteMember(slug: string, memberId: string, currentUserId: string) {
    const { workspace } =
      await this.workspaceAccessService.validateWorkspaceOwner(
        slug,
        currentUserId,
      );

    const member = await this.workspaceMemberRepository.findById(memberId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.workspaceId !== workspace.id) {
      throw new BadRequestException('Member does not belong to workspace');
    }

    if (member.userId === workspace.ownerId) {
      throw new BadRequestException('Cannot remove workspace owner');
    }

    return this.workspaceMemberRepository.delete(memberId);
  }
}
