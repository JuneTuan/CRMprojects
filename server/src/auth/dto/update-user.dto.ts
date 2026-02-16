import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  userName: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsNumber()
  @IsOptional()
  roleId: number;

  @IsString()
  @IsOptional()
  position: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}