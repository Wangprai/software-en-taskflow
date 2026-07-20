import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint to get the profile of the authenticated user
  @Get('profile')
  async getMyProfile(@Request() req: any) {
    const user = await this.usersService.findUserById(req.user.sub);

    if (!user) {
      return { message: 'User not found' };
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
