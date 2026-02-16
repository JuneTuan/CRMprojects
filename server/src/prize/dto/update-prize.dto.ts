import { IsString, IsNumber, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class UpdatePrizeDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  prizeName: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(['券', '实物', '积分'])
  @IsOptional()
  type: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsOptional()
  value: number;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsNumber()
  @IsOptional()
  remainingQuantity: number;

  @IsEnum(['可用', '不可用'])
  @IsOptional()
  status: string;
}