import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/user.repository';
import { PasswordHasher } from './interfaces/password-hasher.abstract';
import { BcryptHasherService } from './bcrypt-hasher.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    { provide: PasswordHasher, useClass: BcryptHasherService },
  ],
  exports: [UsersService],
})
export class UsersModule {}
