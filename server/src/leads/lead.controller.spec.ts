import { Test, TestingModule } from '@nestjs/testing';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateLeadFollowupDto } from './dto/create-lead-followup.dto';
import { Lead } from './lead.entity';
import { LeadFollowup } from './lead-followup.entity';
import { LeadAssignment } from './lead-assignment.entity';
import { User } from '../auth/user.entity';
import { Customer } from '../customer/customer.entity';

// 模拟用户对象
const mockUser: User = {
  userId: 3,
  username: 'admin',
  password: 'password',
  userName: '管理员',
  phone: '13800138000',
  email: 'admin@example.com',
  roleId: 1,
  position: '管理员',
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: null,
  customers: [],
  auditLogs: [],
  assignedLeads: [],
  createdLeads: [],
  createdLeadFollowups: [],
  assignedLeadAssignments: [],
  createdLeadAssignments: [],
};

// 模拟线索对象
const mockLead: Lead = {
  id: 1,
  leadCode: 'LEAD-20260227-12345',
  name: '测试线索',
  phone: '13800138000',
  email: 'test@example.com',
  company: '测试公司',
  position: '测试职位',
  source: 'website',
  sourceDetail: '官网表单',
  description: '客户对产品感兴趣',
  priority: 'high',
  status: 'new',
  assignedTo: 3,
  assignedAt: new Date(),
  score: 80,
  converted: false,
  convertedAt: null,
  convertedAmount: null,
  convertedCustomerId: null,
  closed: false,
  closedAt: null,
  closeReason: null,
  createdBy: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedUser: mockUser,
  createdUser: mockUser,
  convertedCustomer: null,
  followups: [],
  assignments: [],
};

// 模拟跟进记录
const mockFollowup: LeadFollowup = {
  id: 1,
  leadId: 1,
  contactMethod: 'phone',
  contactTime: new Date(),
  contactContent: '客户对产品很感兴趣',
  contactResult: 'success',
  nextFollowup: new Date(Date.now() + 86400000), // 1天后
  attachment: null,
  createdBy: 3,
  createdAt: new Date(),
  lead: mockLead,
  createdUser: mockUser,
};

// 模拟分配记录
const mockAssignment: LeadAssignment = {
  id: 1,
  leadId: 1,
  assignedTo: 3,
  assignedBy: 3,
  assignedAt: new Date(),
  notes: '高优先级线索',
  lead: mockLead,
  assignedUser: mockUser,
  assignedByUser: mockUser,
};

// 模拟线索服务
const mockLeadService = {
  create: jest.fn().mockResolvedValue(mockLead),
  findAll: jest.fn().mockResolvedValue({
    items: [mockLead],
    total: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  }),
  findOne: jest.fn().mockResolvedValue(mockLead),
  update: jest.fn().mockResolvedValue({ ...mockLead, status: 'assigned' }),
  remove: jest.fn().mockResolvedValue(undefined),
  batchRemove: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  addFollowup: jest.fn().mockResolvedValue(mockFollowup),
  getLeadFollowups: jest.fn().mockResolvedValue([mockFollowup]),
  assignLead: jest.fn().mockResolvedValue({ ...mockLead, status: 'assigned' }),
  batchAssignLeads: jest.fn().mockResolvedValue({ assignedCount: 1 }),
  getLeadAssignments: jest.fn().mockResolvedValue([mockAssignment]),
  convertLead: jest.fn().mockResolvedValue({ ...mockLead, converted: true, status: 'converted' }),
  closeLead: jest.fn().mockResolvedValue({ ...mockLead, closed: true, status: 'closed' }),
  getStatistics: jest.fn().mockResolvedValue({
    total: 10,
    new: 2,
    assigned: 3,
    contacting: 2,
    interested: 1,
    converted: 1,
    closed: 1,
    conversionRate: 10.0,
  }),
  getTrends: jest.fn().mockResolvedValue([]),
  getSourceAnalysis: jest.fn().mockResolvedValue([]),
  getSalespersonAnalysis: jest.fn().mockResolvedValue([]),
};

describe('LeadController', () => {
  let leadController: LeadController;
  let leadService: LeadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadController],
      providers: [
        {
          provide: LeadService,
          useValue: mockLeadService,
        },
      ],
    }).compile();

    leadController = module.get<LeadController>(LeadController);
    leadService = module.get<LeadService>(LeadService);
  });

  describe('用户旅程测试', () => {
    it('1. 应该创建一个新的销售线索', async () => {
      const createLeadDto = {
        name: '测试线索',
        phone: '13800138000',
        email: 'test@example.com',
        company: '测试公司',
        position: '测试职位',
        source: 'website',
        sourceDetail: '官网表单',
        description: '客户对产品感兴趣',
        priority: 'high',
        assignedTo: 3,
        createdBy: 3,
      };

      const req = { user: mockUser };

      const result = await leadController.create(createLeadDto, req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('线索创建成功');
      expect(result.data).toEqual(mockLead);
      expect(mockLeadService.create).toHaveBeenCalledWith({
        ...createLeadDto,
        createdBy: mockUser.userId,
      });
    });

    it('2. 应该分配线索给销售人员', async () => {
      const id = 1;
      const assignedTo = 3;
      const notes = '高优先级线索';
      const req = { user: mockUser };
      const body = { assignedTo, notes };

      const result = await leadController.assignLead(id, body, req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('线索分配成功');
      expect(result.data.status).toBe('assigned');
      expect(mockLeadService.assignLead).toHaveBeenCalledWith(
        id,
        assignedTo,
        mockUser.userId,
        notes,
      );
    });

    it('3. 应该添加跟进记录', async () => {
      const id = 1;
      const createLeadFollowupDto: CreateLeadFollowupDto = {
        leadId: 1,
        contactMethod: 'phone',
        contactTime: new Date().toISOString(),
        contactContent: '测试联系内容',
        contactResult: 'success',
        nextFollowup: new Date(Date.now() + 86400000).toISOString(),
        attachment: null,
        createdBy: 3,
      };

      const req = { user: mockUser };

      const result = await leadController.addFollowup(id, createLeadFollowupDto, req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('跟进记录添加成功');
      expect(result.data).toEqual(mockFollowup);
      expect(mockLeadService.addFollowup).toHaveBeenCalledWith({
        ...createLeadFollowupDto,
        leadId: id,
        createdBy: mockUser.userId,
      });
    });

    it('4. 应该获取线索的跟进记录', async () => {
      const id = 1;

      const result = await leadController.getLeadFollowups(id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('操作成功');
      expect(result.data).toEqual([mockFollowup]);
      expect(mockLeadService.getLeadFollowups).toHaveBeenCalledWith(id);
    });

    it('5. 应该获取线索的分配历史', async () => {
      const id = 1;

      const result = await leadController.getLeadAssignments(id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('操作成功');
      expect(result.data).toEqual([mockAssignment]);
      expect(mockLeadService.getLeadAssignments).toHaveBeenCalledWith(id);
    });

    it('6. 应该将线索转化为客户', async () => {
      const id = 1;
      const convertLeadDto = {
        convertedAmount: 10000.00,
        convertedCustomerId: 1,
      };

      const result = await leadController.convertLead(id, convertLeadDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('线索转化成功');
      expect(result.data.converted).toBe(true);
      expect(result.data.status).toBe('converted');
      expect(mockLeadService.convertLead).toHaveBeenCalledWith(
        id,
        convertLeadDto,
      );
    });

    it('7. 应该关闭线索', async () => {
      const id = 1;
      const closeReason = '客户没有意向';

      const result = await leadController.closeLead(id, closeReason);

      expect(result.success).toBe(true);
      expect(result.message).toBe('线索关闭成功');
      expect(result.data.closed).toBe(true);
      expect(result.data.status).toBe('closed');
      expect(mockLeadService.closeLead).toHaveBeenCalledWith(id, closeReason);
    });

    it('8. 应该获取线索列表', async () => {
      const result = await leadController.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('操作成功');
      expect(result.data.items).toEqual([mockLead]);
      expect(result.data.total).toBe(1);
      expect(mockLeadService.findAll).toHaveBeenCalled();
    });

    it('9. 应该获取线索详情', async () => {
      const id = 1;

      const result = await leadController.findOne(id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('操作成功');
      expect(result.data).toEqual(mockLead);
      expect(mockLeadService.findOne).toHaveBeenCalledWith(id);
    });

    it('10. 应该获取线索统计数据', async () => {
      const result = await leadController.getStatistics();

      expect(result.success).toBe(true);
      expect(result.message).toBe('操作成功');
      expect(result.data.total).toBe(10);
      expect(result.data.conversionRate).toBe(10.0);
      expect(mockLeadService.getStatistics).toHaveBeenCalled();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理线索不存在的情况', async () => {
      mockLeadService.findOne.mockRejectedValue(new Error('Lead not found'));

      const id = 999;

      try {
        await leadController.findOne(id);
      } catch (error) {
        expect(error.message).toBe('Lead not found');
      }
    });
  });
});
