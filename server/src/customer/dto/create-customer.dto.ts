import { IsString, IsNotEmpty, IsEmail, Matches, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  @MaxLength(32)
  customerCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  @MaxLength(20)
  phone: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  source: string;

  @IsString()
  @IsOptional()
  remark: string;

  @IsNumber()
  @IsOptional()
  ownerId: number;

  @IsNumber()
  @IsOptional()
  points: number;

  @IsEnum(['普通会员', '白银会员', '黄金会员', '钻石会员'])
  @IsOptional()
  level: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  position: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar: string;

  @IsNumber()
  @IsOptional()
  userId: number;
}