import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  /** Real image URL when user uploads an avatar later. */
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
