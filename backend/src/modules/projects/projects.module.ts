import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectInterface } from './interfaces/project.interface.abstract';

@Module({
  imports: [WorkspacesModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectRepository,
    {
      provide: ProjectInterface,
      useExisting: ProjectRepository,
    },
  ],
  exports: [ProjectsService, ProjectInterface],
})
export class ProjectsModule {}
