import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  unitPrice: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  orderNo: string;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
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
  @IsNotEmpty()
  shippingAddress: string;

  @IsOptional()
  isPoints: boolean;

  @IsNumber()
  @IsOptional()
  points: number;

  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  orderItems: OrderItemDto[];
}