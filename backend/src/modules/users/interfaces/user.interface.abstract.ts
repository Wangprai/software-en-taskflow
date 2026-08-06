import { User, Prisma } from '@prisma/client';

// Defines an abstract class for user interface operations
export abstract class UserInterface {
  abstract create(data: Prisma.UserCreateInput): Promise<User>;

  abstract findByEmail(email: string): Promise<User | null>;

  abstract findById(id: string): Promise<User | null>;

  abstract updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<User>;
}
