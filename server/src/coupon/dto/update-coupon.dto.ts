import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  couponCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  couponName?: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsOptional()
  value?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @IsOptional()
  totalQuantity?: number;

  @IsNumber()
  @IsOptional()
  remainingQuantity?: number;

  @IsNumber()
  @IsOptional()
  maxUsesPerUser?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  minLevel?: string;

  @IsString()
  @IsOptional()
  applicableProducts?: string;

  @IsEnum(['未开始', '进行中', '已结束'])
  @IsOptional()
  status?: string;
}