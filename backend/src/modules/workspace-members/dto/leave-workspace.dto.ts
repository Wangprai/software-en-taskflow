import { IsOptional, IsUUID } from 'class-validator';

export class LeaveWorkspaceDto {
  @IsOptional()
  @IsUUID()
  newOwnerId?: string;
}