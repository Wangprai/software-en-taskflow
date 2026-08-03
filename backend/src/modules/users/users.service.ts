import { ConflictException, Injectable } from '@nestjs/common';
import { UserInterface } from './interfaces/user.interface.abstract';
import { PasswordHasher } from './interfaces/password-hasher.abstract';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserInterface,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  // Creates a new user with hashed password
  async createUser(dto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    // Check if a user with the same email already exists
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);
    return this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
  }

  // Finds a user by email
  async findUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  // Finds a user by ID
  async findUserById(id: string) {
    return this.userRepository.findById(id);
  }

  // Compares a plain password with a hashed password
  async comparePassword(plain: string, hashed: string) {
    return this.passwordHasher.compare(plain, hashed);
  }

  // Update new refresh token
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.userRepository.updateRefreshToken(
      userId,
      refreshToken,
    )
  }
}
