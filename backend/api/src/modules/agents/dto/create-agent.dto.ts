import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAgentDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
  @IsEmail()
  email: string;

  @Transform(({ value }) => String(value ?? '').replace(/\s/g, ''))
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a 10-digit mobile number.' })
  phone: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  city: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
