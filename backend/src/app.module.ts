import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WorkspaceMembersModule } from './modules/workspace-members/workspace-members.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
