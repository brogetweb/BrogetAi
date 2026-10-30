import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';

export class AirSearchDto {
  @IsString()
  @MinLength(3)
  origin!: string;

  @IsString()
  @MinLength(3)
  destination!: string;

  /** Journey date as YYYY-MM-DD (converted to MM/DD/YYYY for BOS). */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  travelDate!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  adults?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9)
  children?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9)
  infants?: number;

  /** 0 economy, 1 business, 2 first, 3 premium economy */
  @IsOptional()
  @IsIn(['0', '1', '2', '3'])
  cabin?: string;

  /** 0 one way, 1 round trip */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  bookingType?: number;

  @IsOptional()
  @IsString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  airlineCode?: string;
}
