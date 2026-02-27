import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class ConvertLeadDto {
  @IsNumber()
  @IsNotEmpty()
  convertedAmount: number;

  @IsNumber()
  @IsNotEmpty()
  convertedCustomerId: number;
}
