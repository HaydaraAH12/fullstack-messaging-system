import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateContactDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  full_name!: string;

  @IsString()
  phone_number!: string;

  @IsString()
  status_id!: string;

  @IsString()
  nationality!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  gender!: string;

  @IsDateString()
  birthday!: string;
}
