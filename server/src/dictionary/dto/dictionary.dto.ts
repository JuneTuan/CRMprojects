import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateDictionaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  dictType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  dictValue: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  dictLabel: string;

  @IsNumber()
  @IsOptional()
  dictSort: number;

  @IsNumber()
  @IsOptional()
  status: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark: string;
}

export class UpdateDictionaryDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  dictType: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  dictValue: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  dictLabel: string;

  @IsNumber()
  @IsOptional()
  dictSort: number;

  @IsNumber()
  @IsOptional()
  status: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark: string;
}

export class QueryDictionaryDto {
  @IsString()
  @IsOptional()
  dictType?: string;

  @IsString()
  @IsOptional()
  dictValue?: string;

  @IsString()
  @IsOptional()
  dictLabel?: string;

  @IsNumber()
  @IsOptional()
  status?: number;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  pageSize?: string;
}
