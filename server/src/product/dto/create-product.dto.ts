import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productName: string;

  @IsString()
  @IsOptional()
  @MaxLength(32)
  productCode: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsNumber()
  @IsOptional()
  categoryId: number;

  @IsEnum(['上架', '下架'])
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsOptional()
  deletedAt: Date;
}