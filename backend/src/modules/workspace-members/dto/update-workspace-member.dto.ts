
import { MemberRole } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateWorkspaceMemberRoleDto {
  @IsEnum(MemberRole)
  role: MemberRole;
}