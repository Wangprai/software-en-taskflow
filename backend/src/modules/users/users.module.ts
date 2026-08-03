import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/user.repository';
import { PasswordHasher } from './interfaces/password-hasher.abstract';
import { BcryptHasherService } from './bcrypt-hasher.service';
import { UserInterface } from './interfaces/user.interface.abstract';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    {
      provide: UserInterface,
      useExisting: UserRepository,
    },
    {
      provide: PasswordHasher,
      useClass: BcryptHasherService,
    },
  ],
  exports: [UsersService, UserInterface],
})
export class UsersModule {}
