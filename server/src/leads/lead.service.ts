import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Lead } from './lead.entity';
import { LeadFollowup } from './lead-followup.entity';
import { LeadAssignment } from './lead-assignment.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateLeadFollowupDto } from './dto/create-lead-followup.dto';
import { CreateLeadAssignmentDto } from './dto/create-lead-assignment.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { Customer } from '../customer/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead) private leadRepository: Repository<Lead>,
    @InjectRepository(LeadFollowup) private leadFollowupRepository: Repository<LeadFollowup>,
    @InjectRepository(LeadAssignment) private leadAssignmentRepository: Repository<LeadAssignment>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
  ) {}

  // Create lead
  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    console.log('=== 创建线索 ===');
    console.log('CreateLeadDto:', JSON.stringify(createLeadDto, null, 2));
    
    // 生成唯一的线索代码：LEAD-YYYYMMDD-XXXXX（年月日-5位随机数）
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    const leadCode = `LEAD-${year}${month}${day}-${random}`;
    
    // 手动执行 SQL 语句来插入线索，确保 leadCode 字段被正确插入
    const query = `
      INSERT INTO leads 
      (lead_code, name, phone, email, company, position, source, source_detail, description, priority, status, assigned_to, assigned_at, score, converted, converted_at, converted_amount, converted_customer_id, closed, closed_at, close_reason, created_by, created_at, updated_at) 
      VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await this.leadRepository.query(query, [
      leadCode,
      createLeadDto.name,
      createLeadDto.phone,
      createLeadDto.email || null,
      createLeadDto.company || null,
      createLeadDto.position || null,
      createLeadDto.source,
      createLeadDto.sourceDetail || null,
      createLeadDto.description || null,
      'medium', // priority
      createLeadDto.assignedTo ? 'assigned' : 'new', // status
      createLeadDto.assignedTo || null,
      createLeadDto.assignedTo ? new Date() : null,
      0, // score
      false, // converted
      null, // converted_at
      null, // converted_amount
      null, // converted_customer_id
      false, // closed
      null, // closed_at
      null, // close_reason
      createLeadDto.createdBy
    ]);
    
    console.log('插入线索结果:', result);
    
    // 获取插入的线索 ID
    const leadId = result.insertId;
    console.log('插入的线索 ID:', leadId);
    
    // 如果设置了assignedTo，创建分配记录
    if (createLeadDto.assignedTo) {
      console.log('创建分配记录');
      const assignment = this.leadAssignmentRepository.create({
        leadId: leadId,
        assignedTo: createLeadDto.assignedTo,
        assignedBy: createLeadDto.createdBy,
        notes: '初始分配',
      });
      await this.leadAssignmentRepository.save(assignment);
      console.log('分配记录创建成功');
    }
    
    return await this.findOne(leadId);
  }

  // Get all leads with pagination and filtering
  async findAll(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    priority?: string,
    source?: string,
    assignedTo?: number,
    keyword?: string,
    startDate?: string,
    endDate?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = this.leadRepository.createQueryBuilder('lead');

    // Apply filters
    if (status) {
      query.andWhere('lead.status = :status', { status });
    }

    if (priority) {
      query.andWhere('lead.priority = :priority', { priority });
    }

    if (source) {
      query.andWhere('lead.source = :source', { source });
    }

    if (assignedTo) {
      query.andWhere('lead.assignedTo = :assignedTo', { assignedTo });
    }

    if (keyword) {
      query.andWhere(
        '(lead.name LIKE :keyword OR lead.phone LIKE :keyword OR lead.email LIKE :keyword OR lead.company LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (startDate && endDate) {
      query.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    // Apply sorting
    query.orderBy(`lead.${sortBy}`, sortOrder);

    // Apply pagination
    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .select(['lead.id', 'lead.leadCode', 'lead.name', 'lead.phone', 'lead.email', 'lead.company', 'lead.position', 'lead.source', 'lead.sourceDetail', 'lead.description', 'lead.priority', 'lead.status', 'lead.assignedTo', 'lead.assignedAt', 'lead.score', 'lead.converted', 'lead.convertedAt', 'lead.convertedAmount', 'lead.convertedCustomerId', 'lead.closed', 'lead.closedAt', 'lead.closeReason', 'lead.createdBy', 'lead.createdAt', 'lead.updatedAt'])
      .leftJoinAndSelect('lead.assignedUser', 'assignedUser')
      .leftJoinAndSelect('lead.createdUser', 'createdUser')
      .getMany();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Get lead by ID
  async findOne(id: number): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      select: ['id', 'leadCode', 'name', 'phone', 'email', 'company', 'position', 'source', 'sourceDetail', 'description', 'priority', 'status', 'assignedTo', 'assignedAt', 'score', 'converted', 'convertedAt', 'convertedAmount', 'convertedCustomerId', 'closed', 'closedAt', 'closeReason', 'createdBy', 'createdAt', 'updatedAt'],
      relations: [
        'assignedUser',
        'createdUser',
        'convertedCustomer',
        'followups',
        'followups.createdUser',
        'assignments',
        'assignments.assignedUser',
        'assignments.assignedByUser',
      ],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  // Update lead
  async update(id: number, updateLeadDto: UpdateLeadDto, assignedBy?: number): Promise<Lead> {
    console.log('=== 更新线索 ===');
    console.log('ID:', id);
    console.log('UpdateLeadDto:', JSON.stringify(updateLeadDto, null, 2));
    
    const lead = await this.leadRepository.findOne({ where: { id } });
    console.log('Lead before update:', JSON.stringify(lead, null, 2));
    
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    
    Object.assign(lead, updateLeadDto);
    console.log('Lead after Object.assign:', JSON.stringify(lead, null, 2));
    
    // 如果 assignedTo 发生变化，创建分配记录
    if (updateLeadDto.assignedTo !== undefined && updateLeadDto.assignedTo !== lead.assignedTo) {
      console.log('负责人发生变化，创建分配记录');
      console.log('原负责人:', lead.assignedTo);
      console.log('新负责人:', updateLeadDto.assignedTo);
      
      // 创建分配记录
      const assignment = this.leadAssignmentRepository.create({
        leadId: id,
        assignedTo: updateLeadDto.assignedTo,
        assignedBy: assignedBy || updateLeadDto.assignedTo,
        notes: '通过编辑表单分配',
      });
      await this.leadAssignmentRepository.save(assignment);
      console.log('分配记录创建成功');
    }
    
    const result = await this.leadRepository.save(lead);
    console.log('Lead after save:', JSON.stringify(result, null, 2));
    
    return await this.findOne(id);
  }

  // Delete lead
  async remove(id: number): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadRepository.remove(lead);
  }

  // Batch delete leads
  async batchRemove(ids: number[]): Promise<{ deletedCount: number }> {
    const result = await this.leadRepository.delete(ids);
    return { deletedCount: result.affected || 0 };
  }

  // Add followup record
  async addFollowup(createLeadFollowupDto: CreateLeadFollowupDto): Promise<LeadFollowup> {
    const followup = this.leadFollowupRepository.create({
      ...createLeadFollowupDto,
      contactTime: new Date(createLeadFollowupDto.contactTime),
      nextFollowup: createLeadFollowupDto.nextFollowup ? new Date(createLeadFollowupDto.nextFollowup) : null,
    });
    return await this.leadFollowupRepository.save(followup);
  }

  // Get lead followups
  async getLeadFollowups(leadId: number): Promise<LeadFollowup[]> {
    return await this.leadFollowupRepository.find({
      where: { leadId },
      relations: ['createdUser'],
      order: { createdAt: 'DESC' },
    });
  }

  // Assign lead
  async assignLead(id: number, assignedTo: number, assignedBy: number, notes?: string): Promise<Lead> {
    // Update lead
    await this.leadRepository.update(id, {
      assignedTo,
      assignedAt: new Date(),
      status: 'assigned',
    });

    // Create assignment record
    const assignment = this.leadAssignmentRepository.create({
      leadId: id,
      assignedTo,
      assignedBy,
      notes,
    });

    await this.leadAssignmentRepository.save(assignment);
    return await this.findOne(id);
  }

  // Batch assign leads
  async batchAssignLeads(ids: number[], assignedTo: number, assignedBy: number, notes?: string): Promise<{ assignedCount: number }> {
    let assignedCount = 0;

    for (const id of ids) {
      try {
        await this.assignLead(id, assignedTo, assignedBy, notes);
        assignedCount++;
      } catch (error) {
        // Skip if lead not found or already assigned
        continue;
      }
    }

    return { assignedCount };
  }

  // Get lead assignments
  async getLeadAssignments(leadId: number): Promise<LeadAssignment[]> {
    return await this.leadAssignmentRepository.find({
      where: { leadId },
      relations: ['assignedUser', 'assignedByUser'],
      order: { assignedAt: 'DESC' },
    });
  }

  // Convert lead to customer
  async convertLead(id: number, convertLeadDto: ConvertLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    const { convertedAmount, convertedCustomerId } = convertLeadDto;
    
    // 如果线索已经转化，抛出错误
    if (lead.converted) {
      throw new Error('线索已经转化，不能重复转化');
    }
    
    // 更新线索状态
    lead.converted = true;
    lead.convertedAt = new Date();
    lead.convertedAmount = convertedAmount;
    lead.convertedCustomerId = convertedCustomerId;
    lead.status = 'converted';
    
    const savedLead = await this.leadRepository.save(lead);
    console.log(`线索 ${id} 已成功转化，客户ID: ${convertedCustomerId}`);
    
    return savedLead;
  }

  // Close lead
  async closeLead(id: number, closeReason: string): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.closed = true;
    lead.closedAt = new Date();
    lead.closeReason = closeReason;
    lead.status = 'closed';
    return await this.leadRepository.save(lead);
  }

  // Get lead statistics
  async getStatistics(startDate?: string, endDate?: string, assignedTo?: number) {
    const query = this.leadRepository.createQueryBuilder('lead');

    if (assignedTo) {
      query.andWhere('lead.assignedTo = :assignedTo', { assignedTo });
    }

    if (startDate && endDate) {
      query.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const total = await query.getCount();
    const newLeads = await query.andWhere('lead.status = :status', { status: 'new' }).getCount();
    const assignedLeads = await query.andWhere('lead.status = :status', { status: 'assigned' }).getCount();
    const contactingLeads = await query.andWhere('lead.status = :status', { status: 'contacting' }).getCount();
    const interestedLeads = await query.andWhere('lead.status = :status', { status: 'interested' }).getCount();
    const convertedLeads = await query.andWhere('lead.converted = :converted', { converted: true }).getCount();
    const closedLeads = await query.andWhere('lead.closed = :closed', { closed: true }).getCount();

    const conversionRate = total > 0 ? (convertedLeads / total) * 100 : 0;

    return {
      total,
      new: newLeads,
      assigned: assignedLeads,
      contacting: contactingLeads,
      interested: interestedLeads,
      converted: convertedLeads,
      closed: closedLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  // Get lead trends
  async getTrends(period: 'day' | 'week' | 'month' | 'year' = 'day', startDate?: string, endDate?: string) {
    // Implementation for trends analysis
    // This would typically involve grouping by date and counting leads
    return [];
  }

  // Get source analysis
  async getSourceAnalysis(startDate?: string, endDate?: string) {
    // Implementation for source analysis
    // This would typically involve grouping by source and counting leads
    return [];
  }

  // Get salesperson analysis
  async getSalespersonAnalysis(startDate?: string, endDate?: string) {
    // Implementation for salesperson analysis
    // This would typically involve grouping by assigned user and counting leads
    return [];
  }
}
