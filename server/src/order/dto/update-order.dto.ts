import { IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @IsOptional()
  productId: number;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  unitPrice: number;
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  orderNo: string;

  @IsNumber()
  @IsOptional()
  customerId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  totalAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  actualAmount: number;

  @IsNumber()
  @IsOptional()
  couponId: number;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  shippingAddress: string;

  @IsOptional()
  isPoints: boolean;

  @IsNumber()
  @IsOptional()
  points: number;

  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsOptional()
  orderItems: OrderItemDto[];
}