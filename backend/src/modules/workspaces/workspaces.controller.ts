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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  // Endpoint to create a new workspace
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createWorkspace(@CurrentUser() user: AuthUser, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.createWorkspace(user.id, dto);
  }

  // Endpoint to get list workspaces
  @Get()
  async getWorkspaces(@CurrentUser() user: AuthUser) {
    return this.workspacesService.findMyWorkspaces(user.id);
  }

  // Endpoint to get workspace detail by slug
  @Get(':slug')
  async getWorkspaceDetail(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
    return this.workspacesService.findWorkspaceBySlug(slug, user.id);
  }

  // Endpoint to update a workspace by ID
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async updateWorkspace(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.updateWorkspace(id, user.id, dto);
  }

  // Endpoint to delete a workspace by ID
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteWorkspace(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    await this.workspacesService.deleteWorkspace(id, user.id);
  }
}
