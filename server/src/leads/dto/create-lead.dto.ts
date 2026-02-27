import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean, IsDate } from 'class-validator';

export class CreateLeadDto {
  @IsString({ message: '姓名必须是字符串' })
  @IsOptional({ message: '姓名不能为空' })
  name: string;

  @IsString({ message: '电话号码必须是字符串' })
  @IsOptional({ message: '电话号码不能为空' })
  phone: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email: string;

  @IsString({ message: '公司名称必须是字符串' })
  @IsOptional()
  company: string;

  @IsString({ message: '职位必须是字符串' })
  @IsOptional()
  position: string;

  @IsString({ message: '来源渠道必须是字符串' })
  @IsOptional({ message: '来源渠道不能为空' })
  source: string;

  @IsString({ message: '来源详情必须是字符串' })
  @IsOptional()
  sourceDetail: string;

  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description: string;

  @IsString({ message: '优先级必须是字符串' })
  @IsOptional()
  priority: string;

  @IsNumber({}, { message: '分配给的用户ID必须是数字' })
  @IsOptional()
  assignedTo: number;

  @IsString({ message: '线索代码必须是字符串' })
  @IsOptional()
  leadCode?: string;

  @IsNumber({}, { message: '创建人ID必须是数字' })
  @IsOptional({ message: '创建人ID不能为空' })
  createdBy: number;
}
