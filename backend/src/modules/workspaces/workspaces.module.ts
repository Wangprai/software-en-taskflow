import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkspaceInterface } from './interfaces/workspace.interface.abstract';
import { GenerateSlugService } from './generate-slug.service';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    GenerateSlugService,
    WorkspaceRepository,
    {
      provide: WorkspaceInterface,
      useExisting: WorkspaceRepository,
    },
  ],
  exports: [WorkspacesService, WorkspaceInterface],
})
export class WorkspacesModule {}
