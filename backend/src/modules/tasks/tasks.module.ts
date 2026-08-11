import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskRepository } from './repositories/task.repository';
import { TaskInterface } from './interfaces/task.interface.abstract';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    WorkspacesModule,
    ProjectsModule,
    UsersModule,
    ActivitiesModule,
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    TaskRepository,
    {
      provide: TaskInterface,
      useExisting: TaskRepository,
    },
  ],
  exports: [TasksService, TaskInterface],
})
export class TasksModule {}
