import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => String(value ?? '').trim().replace(/\s+/g, ' ');

/** Fields an agent may change themselves. Email (the login ID) and agent code are admin-only. */
export class UpdateAgentProfileDto {
  @Transform(trim)
  @IsString()
  @MinLength(2, { message: 'Enter your full name.' })
  @MaxLength(60)
  @Matches(/^[\p{L} .'-]+$/u, { message: 'Name can contain letters, spaces, dots and hyphens only.' })
  name: string;

  @Transform(({ value }) => String(value ?? '').replace(/\D/g, '').slice(-10))
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number.' })
  phone: string;

  @Transform(trim)
  @IsString()
  @MinLength(2, { message: 'Enter your city.' })
  @MaxLength(60)
  city: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Enter your current password.' })
  @MaxLength(128)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters.' })
  @MaxLength(64, { message: 'New password can be at most 64 characters.' })
  @Matches(/[A-Za-z]/, { message: 'New password must contain a letter.' })
  @Matches(/\d/, { message: 'New password must contain a number.' })
  newPassword: string;
}
