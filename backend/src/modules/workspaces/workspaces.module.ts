import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkspaceInterface } from './interfaces/workspace.interface.abstract';
import { GenerateSlugService } from './generate-slug.service';
import { WorkspaceAccessService } from './workspace-access.service';

@Module({
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    GenerateSlugService,
    WorkspaceRepository,
    WorkspaceAccessService,
    {
      provide: WorkspaceInterface,
      useExisting: WorkspaceRepository,
    },
  ],
  exports: [WorkspacesService, WorkspaceInterface, WorkspaceAccessService],
})
export class WorkspacesModule {}
