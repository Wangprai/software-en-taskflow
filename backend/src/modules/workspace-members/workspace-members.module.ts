import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceMemberInterface } from './interfaces/workspace-member.interface.abstract';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceMembersService } from './workspace-members.service';

@Module({
  imports: [PrismaModule, WorkspacesModule, UsersModule],
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
