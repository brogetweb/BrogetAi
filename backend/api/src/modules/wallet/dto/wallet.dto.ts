import { Type } from 'class-transformer';
import { Allow, IsBoolean, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export class CreateTopupDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(300, { message: 'Minimum amount is ₹300.' })
  @Max(500000)
  amount: number;

  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a 10-digit mobile number.' })
  mobile: string;
}

export class CreatePayoutDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(500000)
  amount: number;

  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a 10-digit mobile number.' })
  mobile: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  holderName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  bankName: string;

  @Matches(/^\d{9,18}$/, { message: 'Enter the bank account number.' })
  accountNumber: string;

  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Enter a valid IFSC code.' })
  ifsc: string;
}

export class PayinWebhookDto {
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsString()
  order_id: string;

  @IsOptional()
  @Allow()
  amount?: string | number;

  @IsOptional()
  @IsString()
  utr?: string;

  @IsOptional()
  @IsString()
  status_text?: string;
}

export class PayoutWebhookDataDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  request_id: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  charge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_amount?: number;

  @IsOptional()
  @IsString()
  transfer_mode?: string;

  @IsOptional()
  @IsString()
  utr?: string;
}

export class PayoutWebhookDto {
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  message?: string;

  @ValidateNested()
  @Type(() => PayoutWebhookDataDto)
  data: PayoutWebhookDataDto;
}
