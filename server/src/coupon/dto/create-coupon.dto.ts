import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  couponCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  couponName: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsNotEmpty()
  value: number;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  totalQuantity: number;

  @IsNumber()
  @IsNotEmpty()
  remainingQuantity: number;

  @IsNumber()
  @IsOptional()
  maxUsesPerUser: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  minLevel: string;

  @IsString()
  @IsOptional()
  applicableProducts: string;

  @IsEnum(['未开始', '进行中', '已结束'])
  @IsOptional()
  status: string;
}