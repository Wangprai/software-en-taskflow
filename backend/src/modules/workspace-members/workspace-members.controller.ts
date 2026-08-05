import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkspaceMemberDto } from './dto/create-workspace-member.dto';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CurrentUser } from '../../decorators/current-user.decorator';

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
