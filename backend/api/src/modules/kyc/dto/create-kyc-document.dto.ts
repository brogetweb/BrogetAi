import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateKycDocumentDto {
  @IsIn(['Aadhaar', 'PAN', 'Selfie', 'Address'])
  kind: 'Aadhaar' | 'PAN' | 'Selfie' | 'Address';

  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  fileName: string;

  @IsOptional()
  @IsString()
  @MaxLength(7_000_000)
  dataBase64?: string;
}
