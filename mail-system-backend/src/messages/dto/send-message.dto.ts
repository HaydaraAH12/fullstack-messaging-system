import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { RecipientType } from '@prisma/client';

export class RecipientDto {
  @IsUUID()
  userId!: string;

  @IsEnum(RecipientType)
  @IsOptional()
  type?: RecipientType = RecipientType.TO;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  /**
   * When using `multipart/form-data`, `recipients` typically arrives as a JSON string.
   * Example: '[{"userId":"...","type":"TO"}]'
   */
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients!: RecipientDto[];

  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  parentMessageId?: string;
}
