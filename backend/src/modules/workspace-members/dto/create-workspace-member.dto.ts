import { MemberRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkspaceMemberDto {
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(MemberRole, { message: 'Invalid role' })
  role: MemberRole;
}
