import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class FlightSnapshotDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsString()
  airline!: string;

  @IsOptional()
  @IsString()
  airlineCode?: string;

  @IsString()
  flightCode!: string;

  @IsString()
  fromCode!: string;

  @IsString()
  toCode!: string;

  @IsString()
  date!: string;

  @IsString()
  depart!: string;

  @IsString()
  arrive!: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  cabin?: string;
}

class PassengerDto {
  @IsString()
  @MinLength(1)
  fullName!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class FlightQuoteDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  netFare!: number;

  @IsIn(['domestic', 'international'])
  sector!: 'domestic' | 'international';
}

export class FlightCheckoutDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  netFare!: number;

  @IsIn(['domestic', 'international'])
  sector!: 'domestic' | 'international';

  @ValidateNested()
  @Type(() => FlightSnapshotDto)
  flight!: FlightSnapshotDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/)
  payMobile?: string;
}

export class FlightPayWebhookDto {
  @IsOptional()
  status?: boolean | string | number;

  @IsOptional()
  @IsString()
  status_text?: string;

  @IsOptional()
  @IsString()
  order_id?: string;

  @IsOptional()
  amount?: number | string;

  @IsOptional()
  @IsString()
  utr?: string;
}
