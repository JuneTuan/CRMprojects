import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { LeadFollowup } from './lead-followup.entity';
import { LeadAssignment } from './lead-assignment.entity';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { Customer } from '../customer/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, LeadFollowup, LeadAssignment, Customer]),
    forwardRef(() => require('../order/order.module').OrderModule),
  ],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadModule {}
