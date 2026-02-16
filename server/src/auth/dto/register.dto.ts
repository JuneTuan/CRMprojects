import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsOptional, IsNumber, MaxLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsPhoneNumber('CN')
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email: string;

  @IsEnum(['普通会员', '白银会员', '黄金会员', '钻石会员'])
  @IsOptional()
  level: string;

  @IsNumber()
  @IsOptional()
  roleId: number;
}