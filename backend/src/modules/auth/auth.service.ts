import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

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
    const { password, refreshToken, ...userWithoutPassword } = user;
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
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRE_IN as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
    });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // Logout a user
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: `User ${userId} logged out successfully` };
  }

  // Refresh new token
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });

      const user = await this.usersService.findUserById(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('User not found or invalid token');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        name: user.name,
        email: user.email,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: process.env.JWT_EXPIRE_IN as any,
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
      });

      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
