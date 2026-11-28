import { ArrayMaxSize, IsArray, IsEmail, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class TicketPdfDto {
  @IsString()
  @MinLength(3)
  bookingId!: string;

  @IsOptional()
  @IsString()
  pnr?: string;

  @IsString()
  @MinLength(2)
  airline!: string;

  @IsString()
  @MinLength(2)
  flightCode!: string;

  @IsString()
  @MinLength(3)
  fromCode!: string;

  @IsString()
  @MinLength(3)
  toCode!: string;

  @IsString()
  @MinLength(3)
  date!: string;

  @IsString()
  depart!: string;

  @IsString()
  arrive!: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsString()
  @MinLength(2)
  travellerName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /** Rupees, up to 2 decimals (orders include paise, e.g. 6890.58). */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total!: number;

  @IsOptional()
  @IsString()
  cabin?: string;

  @IsOptional()
  @IsString()
  airlineCode?: string;

  @IsOptional()
  @IsString()
  fromCity?: string;

  @IsOptional()
  @IsString()
  toCity?: string;

  /** Every traveller on the booking ("Mr Rohit Kumar"). Optional; older apps send only travellerName. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9)
  @IsString({ each: true })
  passengers?: string[];

  /** Optional fare breakup in rupees, printed in the Fare summary. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  netFare?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  convenienceFee?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  gst?: number;
}
