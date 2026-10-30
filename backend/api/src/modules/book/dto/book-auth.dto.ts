import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class BookRegisterDto {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{10}$/)
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsIn(['Male', 'Female', 'Other'])
  gender?: string;
}

export class BookLoginDto {
  @IsString()
  @MinLength(3)
  emailOrPhone!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
