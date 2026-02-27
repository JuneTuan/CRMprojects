import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean } from 'class-validator';

export class UpdateLeadDto {
  @IsString({ message: '姓名必须是字符串' })
  @IsOptional()
  name: string;

  @IsString({ message: '电话号码必须是字符串' })
  @IsOptional()
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
  @IsOptional()
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
  leadCode: string;

  @IsNumber({}, { message: '评分必须是数字' })
  @IsOptional()
  score: number;

  @IsBoolean({ message: '是否已转化必须是布尔值' })
  @IsOptional()
  converted: boolean;

  @IsNumber({}, { message: '转化金额必须是数字' })
  @IsOptional()
  convertedAmount: number;

  @IsNumber({}, { message: '转化的客户ID必须是数字' })
  @IsOptional()
  convertedCustomerId: number;

  @IsBoolean({ message: '是否已关闭必须是布尔值' })
  @IsOptional()
  closed: boolean;

  @IsString({ message: '关闭原因必须是字符串' })
  @IsOptional()
  closeReason: string;
}
