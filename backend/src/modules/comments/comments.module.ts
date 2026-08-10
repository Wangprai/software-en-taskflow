import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspaceMemberInterface } from '../workspace-members/interfaces/workspace-member.interface.abstract';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { CommentsService } from './comments.service';
import { CommentInterface } from './interfaces/comment.interface.abstract';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { ProjectsModule } from '../projects/projects.module';
import { CommentsController } from './comments.controller';
import { CommentRepository } from './repositories/comment.repository';

@Module({
  imports: [
    TasksModule,
    WorkspacesModule,
    ProjectsModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentRepository,
    {
      provide: CommentInterface,
      useExisting: CommentRepository,
    },
  ],
  exports: [CommentsService, CommentInterface],
})
export class CommentsModule {}
