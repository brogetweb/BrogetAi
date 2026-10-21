import { Equals, IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCreditReportDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  firstName: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  lastName: string;

  @Transform(({ value }) => String(value ?? '').replace(/\s/g, ''))
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a 10-digit mobile number.' })
  mobile: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be YYYY-MM-DD.' })
  dateOfBirth: string;

  @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
  @IsEmail()
  email: string;

  @Transform(({ value }) => String(value ?? '').trim().toUpperCase())
  @Matches(/^[A-Z]{5}\d{4}[A-Z]$/, { message: 'Enter a valid PAN.' })
  pan: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @Matches(/^\d{4,6}$/, { message: 'Enter the OTP shared with the customer.' })
  otp: string;

  @Equals('Yes', { message: 'The customer must accept consent before a credit analytics report.' })
  consentAcceptance: 'Yes';
}
