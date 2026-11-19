import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const clean = ({ value }: { value: unknown }) => String(value ?? '').trim().replace(/\s+/g, ' ');

/** Super admin edits an agent's profile (including the login email). */
export class UpdateAgentDto {
  @Transform(clean)
  @IsString()
  @MinLength(2, { message: 'Enter the full name.' })
  @MaxLength(80)
  name: string;

  @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
  @IsEmail({}, { message: 'Enter a valid email.' })
  email: string;

  @Transform(({ value }) => String(value ?? '').replace(/\D/g, '').slice(-10))
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number.' })
  phone: string;

  @Transform(clean)
  @IsString()
  @MinLength(2, { message: 'Enter the city.' })
  @MaxLength(60)
  city: string;
}

/** Super admin sets a new password for an agent. Same rules as the agent's own change. */
export class ResetAgentPasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(64, { message: 'Password can be at most 64 characters.' })
  @Matches(/[A-Za-z]/, { message: 'Password must contain a letter.' })
  @Matches(/\d/, { message: 'Password must contain a number.' })
  newPassword: string;
}
