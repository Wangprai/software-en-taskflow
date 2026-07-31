import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto';
import { UsersService } from '../users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // Endpoint for user registration
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'User registered successfully', user };
  }

  // Endpoint for user login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Endpoint to get the profile of the authenticated user
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(@Request() req: any) {
    const user = await this.usersService.findUserById(req.user.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, refreshToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  // Endpoint for user logout
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: any) {
    await this.authService.logout(req.user.sub);
    return { message: 'User logged out successfully' };
  }

  // Endpoint for refresh token
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}
