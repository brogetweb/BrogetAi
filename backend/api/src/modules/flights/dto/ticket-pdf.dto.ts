import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

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

  @IsInt()
  @Min(0)
  total!: number;

  @IsOptional()
  @IsString()
  cabin?: string;
}
