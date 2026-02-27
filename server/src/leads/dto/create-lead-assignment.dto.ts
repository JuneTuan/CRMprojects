import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLeadAssignmentDto {
  @IsNumber({}, { message: '线索ID必须是数字' })
  @IsOptional({ message: '线索ID不能为空' })
  leadId: number;

  @IsNumber({}, { message: '分配给的用户ID必须是数字' })
  @IsOptional({ message: '分配给的用户ID不能为空' })
  assignedTo: number;

  @IsNumber({}, { message: '分配人ID必须是数字' })
  @IsOptional({ message: '分配人ID不能为空' })
  assignedBy: number;

  @IsString({ message: '分配备注必须是字符串' })
  @IsOptional()
  notes: string;
}
