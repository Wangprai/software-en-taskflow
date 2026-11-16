import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateWorkspaceMemberRoleDto } from './dto/update-workspace-member.dto';
import { LeaveWorkspaceDto } from './dto/leave-workspace.dto';

@ApiTags('Workspace-members')
@ApiBearerAuth('access-token')
@Controller('workspaces/:slug/members')
@UseGuards(JwtAuthGuard)
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  // Endpoint to add member in workspace
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async addMember(
    @Param('slug') slug: string,
    @Body() dto: CreateWorkspaceMemberDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspaceMembersService.addMember(slug, dto, user.id);
  }

  // Endpoint to get all members in workspaces
  @Get()
  async getMembers(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
    return this.workspaceMembersService.getAllMembers(slug, user.id);
  }

  // Endpoint to leave workspace
  @HttpCode(HttpStatus.OK)
  @Post('leave')
  async leaveWorkspace(
    @Param('slug') slug: string,
    @Body() dto: LeaveWorkspaceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspaceMembersService.leaveWorkspace(slug, dto, user.id);
  }

  // Endpoint to update member role in workspace
  @HttpCode(HttpStatus.OK)
  @Patch(':memberId/role')
  async updateMemberRole(
    @Param('slug') slug: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateWorkspaceMemberRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspaceMembersService.updateMemberRole(
      slug,
      memberId,
      dto,
      user.id,
    );
  }

  // Endpoint to delete a member in workspace
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':memberId')
  async deleteMember(
    @Param('slug') slug: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.workspaceMembersService.deleteMember(slug, memberId, user.id);
  }
}
