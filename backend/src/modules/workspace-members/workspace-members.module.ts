import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { WorkspaceMemberInterface } from './interfaces/workspace-member.interface.abstract';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [UsersModule, WorkspacesModule],
  controllers: [WorkspaceMembersController],
  providers: [
    WorkspaceMembersService,
    WorkspaceMemberRepository,
    {
      provide: WorkspaceMemberInterface,
      useExisting: WorkspaceMemberRepository,
    },
  ],
  exports: [WorkspaceMembersService, WorkspaceMemberInterface],
})
export class WorkspaceMembersModule {}
