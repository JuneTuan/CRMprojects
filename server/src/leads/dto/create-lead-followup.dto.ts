import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateLeadFollowupDto {
  @IsNumber({}, { message: '线索ID必须是数字' })
  @IsOptional({ message: '线索ID不能为空' })
  leadId: number;

  @IsString({ message: '联系方式必须是字符串' })
  @IsOptional({ message: '联系方式不能为空' })
  contactMethod: string;

  @IsDateString({}, { message: '联系时间必须是日期字符串' })
  @IsOptional({ message: '联系时间不能为空' })
  contactTime: string;

  @IsString({ message: '联系内容必须是字符串' })
  @IsOptional()
  contactContent: string;

  @IsString({ message: '联系结果必须是字符串' })
  @IsOptional({ message: '联系结果不能为空' })
  contactResult: string;

  @IsDateString({}, { message: '下次跟进时间必须是日期字符串' })
  @IsOptional()
  nextFollowup: string;

  @IsString({ message: '附件路径必须是字符串' })
  @IsOptional()
  attachment: string;

  @IsNumber({}, { message: '创建人ID必须是数字' })
  @IsOptional({ message: '创建人ID不能为空' })
  createdBy: number;
}
