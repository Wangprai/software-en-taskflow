import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Register a new user
  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);

    // Return the user data without the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Authenticate a user and generate a JWT token
  async login(dto: LoginDto) {
    const user = await this.usersService.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await this.usersService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate a JWT token for the authenticated user
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // User data without the password and the access token
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken };
  }

  // Logout a user
  async logout(userId: string) {
    return { message: `User ${userId} logged out successfully` };
  }
}
