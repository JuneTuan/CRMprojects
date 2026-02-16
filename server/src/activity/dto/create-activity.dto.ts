import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, MaxLength, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WinRateConfigDto {
  @IsNumber()
  @IsOptional()
  prizeId?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  probability?: number;
}

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  activityName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  activityCode: string;

  @IsEnum(['游戏活动', '积分活动', '优惠券活动', '混合活动'])
  @IsOptional()
  activityType: string;

  @IsEnum(['slot-machine', 'blind-box', 'wheel', 'scratch-card', 'nine-grid'])
  @IsOptional()
  gameType: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsOptional()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate: string;

  @IsEnum(['未开始', '进行中', '已结束'])
  @IsOptional()
  status: string;

  @IsNumber()
  @IsOptional()
  maxParticipants: number;

  @IsNumber()
  @IsOptional()
  maxDrawsPerUser: number;

  @IsNumber()
  @IsOptional()
  minPoints: number;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WinRateConfigDto)
  winRateConfig?: WinRateConfigDto[];
}