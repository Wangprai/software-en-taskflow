import { Injectable } from '@nestjs/common';
import { PasswordHasher } from './interfaces/password-hasher.abstract';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptHasherService implements PasswordHasher {
  // Hashes a password using bcrypt with a salt
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(6);
    return bcrypt.hash(password, salt);
  }

  // Compares a plain password with a hashed password using bcrypt
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
