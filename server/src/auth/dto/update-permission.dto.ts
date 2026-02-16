import { IsString, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  description: string;
}