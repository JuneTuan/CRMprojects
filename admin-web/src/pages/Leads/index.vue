<template>
  <div class="leads-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>销售线索管理</h2>
          <el-button type="primary" @click="handleCreateLead">
            <el-icon><Plus /></el-icon> 新建线索
          </el-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="searchParams" class="mb-4">
        <el-form-item label="状态">
          <el-select v-model="searchParams.status" placeholder="选择状态">
            <el-option label="全部" value="" />
            <el-option label="新线索" value="new" />
            <el-option label="已分配" value="assigned" />
            <el-option label="联系中" value="contacting" />
            <el-option label="意向明确" value="interested" />
            <el-option label="已转化" value="converted" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchParams.priority" placeholder="选择优先级">
            <el-option label="全部" value="" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="searchParams.source" placeholder="选择来源">
            <el-option label="全部" value="" />
            <el-option
              v-for="item in leadSourceDict"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchParams.keyword" placeholder="姓名/电话/公司" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 线索列表 -->
      <el-table
        v-loading="loading"
        :data="leadsList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="leadCode" label="线索编码" width="180" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="company" label="公司" width="150" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column prop="source" label="来源" width="100">
          <template #default="scope">
            {{ getSourceLabel(scope.row.source) }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="120">
          <template #default="scope">
            {{ scope.row.assignedUser?.user_name || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleViewLead(scope.row)">
              查看
            </el-button>
            <el-button size="small" type="primary" @click="handleEditLead(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteLead(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑线索对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item v-if="form.leadCode" label="线索编码">
          <el-input v-model="form.leadCode" disabled placeholder="自动生成" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="form.company" placeholder="请输入公司" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="来源" prop="source">
          <el-select v-model="form.source" placeholder="请选择来源">
            <el-option
              v-for="item in leadSourceDict"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="来源详情" prop="sourceDetail">
          <el-input v-model="form.sourceDetail" placeholder="请输入来源详情" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="assignedTo">
          <el-select v-model="form.assignedTo" placeholder="请选择负责人">
            <el-option
              v-for="user in users"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量操作"
      width="500px"
    >
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-select v-model="batchForm.type" placeholder="请选择操作类型">
            <el-option label="批量分配" value="assign" />
            <el-option label="批量删除" value="delete" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="batchForm.type === 'assign'" label="负责人">
          <el-select v-model="batchForm.assignedTo" placeholder="请选择负责人">
            <el-option
              v-for="user in users"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 线索详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="线索详情"
      width="800px"
    >
      <div v-if="currentLead" class="lead-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="线索编码">{{ currentLead.leadCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentLead.name }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ currentLead.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentLead.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="公司">{{ currentLead.company || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ currentLead.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ currentLead.source }}</el-descriptions-item>
          <el-descriptions-item label="来源详情">{{ currentLead.sourceDetail || '-' }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ getPriorityText(currentLead.priority) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentLead.status) }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentLead.assignedUser?.userName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentLead.createdUser?.userName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentLead.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentLead.description || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 跟进记录 -->
        <div class="mt-4">
          <h3 class="mb-2">跟进记录</h3>
          <el-button type="primary" size="small" @click="handleAddFollowup">
            <el-icon><Plus /></el-icon> 添加跟进
          </el-button>
          <el-table :data="currentLead.followups" style="width: 100%; margin-top: 10px">
            <el-table-column prop="contactMethod" label="联系方式" width="120" />
            <el-table-column prop="contactTime" label="联系时间" width="180" />
            <el-table-column prop="contactContent" label="联系内容" />
            <el-table-column prop="contactResult" label="联系结果" width="100" />
            <el-table-column prop="nextFollowup" label="下次跟进" width="180" />
            <el-table-column label="创建人" width="120">
              <template #default="scope">
                {{ scope.row.createdUser?.userName || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分配历史 -->
        <div class="mt-4">
          <h3 class="mb-2">分配历史</h3>
          <el-table :data="currentLead.assignments" style="width: 100%">
            <el-table-column label="被分配人" width="120">
              <template #default="scope">
                {{ scope.row.assignedUser?.userName || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="分配人" width="120">
              <template #default="scope">
                {{ scope.row.assignedByUser?.userName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="assignedAt" label="分配时间" width="180" />
            <el-table-column prop="notes" label="备注" />
          </el-table>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-4">
          <el-button v-if="!currentLead.assignedTo" type="primary" @click="handleAssignLead">分配线索</el-button>
          <el-button type="success" @click="handleConvertLead">转化为客户</el-button>
          <el-button type="warning" @click="handleCloseLead">关闭线索</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加跟进记录对话框 -->
    <el-dialog
      v-model="followupDialogVisible"
      title="添加跟进记录"
      width="600px"
    >
      <el-form :model="followupForm" :rules="followupRules" ref="followupFormRef" label-width="100px">
        <el-form-item label="联系方式" prop="contactMethod">
          <el-select v-model="followupForm.contactMethod" placeholder="请选择联系方式">
            <el-option label="电话" value="phone" />
            <el-option label="邮件" value="email" />
            <el-option label="短信" value="sms" />
            <el-option label="面谈" value="meeting" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系时间" prop="contactTime">
          <el-date-picker
            v-model="followupForm.contactTime"
            type="datetime"
            placeholder="选择联系时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系内容" prop="contactContent">
          <el-input v-model="followupForm.contactContent" type="textarea" placeholder="请输入联系内容" />
        </el-form-item>
        <el-form-item label="联系结果" prop="contactResult">
          <el-select v-model="followupForm.contactResult" placeholder="请选择联系结果">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="待跟进" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="下次跟进" prop="nextFollowup">
          <el-date-picker
            v-model="followupForm.nextFollowup"
            type="datetime"
            placeholder="选择下次跟进时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="followupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitFollowup">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配线索对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配线索"
      width="400px"
    >
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="负责人" prop="assignedTo">
          <el-select v-model="assignForm.assignedTo" placeholder="请选择负责人" style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitAssign">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { leadsApi, userApi } from '@/api';
import { dictionaryApi } from '@/api/dictionary';
import request from '@/api';

const router = useRouter();

// 状态管理
const loading = ref(false);
const leadsList = ref<any[]>([]);
const total = ref(0);
const selectedLeads = ref<any[]>([]);
const currentLead = ref<any>(null);
const users = ref<any[]>([]);
const leadSourceDict = ref<any[]>([]);

// 分页参数
const pageParams = reactive({
  page: 1,
  pageSize: 20,
});

// 搜索参数
const searchParams = reactive({
  status: '',
  priority: '',
  source: '',
  keyword: '',
});

// 对话框状态
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const batchDialogVisible = ref(false);
const followupDialogVisible = ref(false);
const assignDialogVisible = ref(false);
const dialogTitle = ref('新建线索');

// 表单数据
const form = reactive({
  id: null,
  name: '',
  phone: '',
  email: '',
  company: '',
  position: '',
  source: 'website',
  sourceDetail: '',
  description: '',
  priority: 'medium',
  assignedTo: null,
});

// 批量操作表单
const batchForm = reactive({
  type: 'assign',
  assignedTo: null,
});

// 分配表单
const assignForm = reactive({
  assignedTo: null,
});

// 跟进记录表单
const followupForm = reactive({
  contactMethod: 'phone',
  contactTime: new Date(),
  contactContent: '',
  contactResult: 'success',
  nextFollowup: null,
});

// 表单验证规则
const rules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
});

const followupRules = reactive({
  contactMethod: [{ required: true, message: '请选择联系方式', trigger: 'change' }],
  contactTime: [{ required: true, message: '请选择联系时间', trigger: 'change' }],
  contactContent: [{ required: true, message: '请输入联系内容', trigger: 'blur' }],
  contactResult: [{ required: true, message: '请选择联系结果', trigger: 'change' }],
});

// 表单引用
const formRef = ref<any>(null);
const followupFormRef = ref<any>(null);

// 生命周期
onMounted(() => {
  getLeadsList();
  getUsers();
  getLeadSourceDict();
});

// 获取线索来源字典
const getLeadSourceDict = async () => {
  try {
    const response: any = await dictionaryApi.getByType('lead_source');
    leadSourceDict.value = response || [];
  } catch (error) {
    console.error('获取线索来源字典失败:', error);
  }
};

// 获取线索列表
const getLeadsList = async () => {
  loading.value = true;
  try {
    const response = await leadsApi.list({
      ...pageParams,
      ...searchParams,
    });
    if (response.success) {
      leadsList.value = response.data.items;
      total.value = response.data.total;
    }
  } catch (error) {
    console.error('获取线索列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取用户列表
const getUsers = async () => {
  try {
    console.log('开始获取用户列表');
    const usersList = await userApi.list();
    console.log('获取用户列表成功:', usersList);
    if (Array.isArray(usersList)) {
      users.value = usersList;
      console.log('用户列表已更新:', users.value);
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pageParams.page = 1;
  getLeadsList();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchParams).forEach(key => {
    searchParams[key] = '';
  });
  pageParams.page = 1;
  getLeadsList();
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageParams.pageSize = size;
  getLeadsList();
};

const handleCurrentChange = (current: number) => {
  pageParams.page = current;
  getLeadsList();
};

// 选择处理
const handleSelectionChange = (selection: any[]) => {
  selectedLeads.value = selection;
};

// 新建线索
const handleCreateLead = () => {
  dialogTitle.value = '新建线索';
  form.id = null;
  form.name = '';
  form.phone = '';
  form.email = '';
  form.company = '';
  form.position = '';
  form.source = 'website';
  form.sourceDetail = '';
  form.description = '';
  form.priority = 'medium';
  form.assignedTo = null;
  dialogVisible.value = true;
};

// 编辑线索
const handleEditLead = (row: any) => {
  dialogTitle.value = '编辑线索';
  form.id = row.id;
  form.name = row.name;
  form.phone = row.phone;
  form.email = row.email;
  form.company = row.company;
  form.position = row.position;
  form.source = row.source;
  form.sourceDetail = row.sourceDetail;
  form.description = row.description;
  form.priority = row.priority;
  form.assignedTo = row.assignedUser?.userId;
  dialogVisible.value = true;
};

// 查看线索
const handleViewLead = async (row: any) => {
  try {
    const response = await leadsApi.detail(row.id);
    if (response.success) {
      currentLead.value = response.data;
      detailDialogVisible.value = true;
    }
  } catch (error) {
    console.error('获取线索详情失败:', error);
  }
};

// 更新线索数据（不打开对话框）
const updateLeadData = async (leadId: number) => {
  try {
    console.log('开始更新线索数据，ID:', leadId);
    const response = await leadsApi.detail(leadId);
    console.log('获取线索详情响应:', response);
    if (response.success) {
      currentLead.value = response.data;
      console.log('线索详情数据:', response.data);
      console.log('分配历史:', response.data.assignments);
      if (response.data.assignments && response.data.assignments.length > 0) {
        console.log('第一个分配记录:', response.data.assignments[0]);
        console.log('分配人信息:', response.data.assignments[0].assignedByUser);
      }
    }
  } catch (error) {
    console.error('更新线索数据失败:', error);
  }
};

// 删除线索
const handleDeleteLead = (id: number) => {
  ElMessageBox.confirm('确定要删除这条线索吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await leadsApi.delete(id);
      if (response.success) {
        ElMessage.success('删除成功');
        getLeadsList();
      }
    } catch (error) {
      console.error('删除线索失败:', error);
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  console.log('=== 开始提交表单 ===');
  console.log('表单数据:', JSON.stringify(form, null, 2));
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let response;
        
        if (form.id) {
          // 构建更新数据
          const updateData = {
            name: form.name,
            phone: form.phone,
            email: form.email || null,
            company: form.company || null,
            position: form.position || null,
            source: form.source,
            sourceDetail: form.sourceDetail || null,
            description: form.description || null,
            priority: form.priority,
            assignedTo: form.assignedTo,
          };
          console.log('更新数据:', JSON.stringify(updateData, null, 2));
          console.log('更新ID:', form.id);
          response = await leadsApi.update(form.id, updateData);
          console.log('更新响应:', JSON.stringify(response, null, 2));
        } else {
          // 构建创建数据（不包含id字段）
          const createData = {
            name: form.name,
            phone: form.phone,
            email: form.email || null,
            company: form.company || null,
            position: form.position || null,
            source: form.source,
            sourceDetail: form.sourceDetail || null,
            description: form.description || null,
            priority: form.priority,
            assignedTo: form.assignedTo,
          };
          console.log('创建数据:', JSON.stringify(createData, null, 2));
          response = await leadsApi.create(createData);
          console.log('创建响应:', JSON.stringify(response, null, 2));
        }
        if (response.success) {
          ElMessage.success(form.id ? '更新成功' : '创建成功');
          dialogVisible.value = false;
          getLeadsList();
        }
      } catch (error) {
        console.error('提交失败:', error);
        console.error('错误详情:', JSON.stringify(error, null, 2));
      }
    } else {
      console.log('表单验证失败');
    }
  });
};

// 批量操作
const handleBatchSubmit = async () => {
  if (selectedLeads.value.length === 0) {
    ElMessage.warning('请选择要操作的线索');
    return;
  }

  const ids = selectedLeads.value.map(item => item.id);

  try {
    if (batchForm.type === 'assign') {
      const response = await leadsApi.batchAssign({
        ids,
        assignedTo: batchForm.assignedTo,
      });
      if (response.success) {
        ElMessage.success('批量分配成功');
      }
    } else if (batchForm.type === 'delete') {
      const response = await leadsApi.batchDelete(ids);
      if (response.success) {
        ElMessage.success('批量删除成功');
      }
    }
    batchDialogVisible.value = false;
    getLeadsList();
  } catch (error) {
    console.error('批量操作失败:', error);
  }
};

// 添加跟进记录
const handleAddFollowup = () => {
  followupForm.contactMethod = 'phone';
  followupForm.contactTime = new Date();
  followupForm.contactContent = '';
  followupForm.contactResult = 'success';
  followupForm.nextFollowup = null;
  followupDialogVisible.value = true;
};

// 提交跟进记录
const handleSubmitFollowup = async () => {
  if (!followupFormRef.value) return;
  followupFormRef.value.validate(async (valid: boolean) => {
    if (valid && currentLead.value) {
      try {
        const response = await leadsApi.addFollowup(currentLead.value.id, followupForm);
        if (response.success) {
          ElMessage.success('添加跟进记录成功');
          followupDialogVisible.value = false;
          // 更新线索数据（不重新打开对话框）
          updateLeadData(currentLead.value.id);
        }
      } catch (error) {
        console.error('添加跟进记录失败:', error);
      }
    }
  });
};

// 分配线索
const handleAssignLead = () => {
  if (!currentLead.value) return;
  console.log('开始分配线索，当前线索ID:', currentLead.value.id);
  console.log('用户列表:', users.value);
  
  // 重置表单
  assignForm.assignedTo = null;
  
  // 打开分配对话框
  assignDialogVisible.value = true;
};

// 提交分配
const handleSubmitAssign = async () => {
  if (!assignForm.assignedTo) {
    ElMessage.warning('请选择负责人');
    return;
  }
  
  try {
    console.log('分配负责人ID:', assignForm.assignedTo);
    console.log('分配线索ID:', currentLead.value.id);
    const response = await leadsApi.assign(currentLead.value.id, {
      assignedTo: parseInt(assignForm.assignedTo),
    });
    console.log('分配响应:', response);
    if (response.success) {
      ElMessage.success('分配成功');
      assignDialogVisible.value = false;
      // 更新线索数据（不重新打开对话框）
      updateLeadData(currentLead.value.id);
    } else {
      console.error('分配失败，响应:', response);
    }
  } catch (error) {
    console.error('分配失败:', error);
  }
};

// 转化为客户 - 跳转到订单管理页面
const handleConvertLead = () => {
  if (!currentLead.value) return;
  
  // 跳转到订单管理页面，传递线索信息
  router.push({
    path: '/order',
    query: {
      leadId: currentLead.value.id,
      leadName: currentLead.value.name,
      leadPhone: currentLead.value.phone,
      leadEmail: currentLead.value.email || '',
      leadCompany: currentLead.value.company || '',
      leadSource: currentLead.value.source || '',
    },
  });
};

// 关闭线索
const handleCloseLead = () => {
  if (!currentLead.value) return;
  ElMessageBox.prompt('请输入关闭原因', '关闭线索', {
    inputPlaceholder: '输入关闭原因',
    inputValidator: (value) => {
      if (!value) return '请输入关闭原因';
      return true;
    },
  }).then(async ({ value }) => {
    try {
      const response = await leadsApi.close(currentLead.value.id, {
        closeReason: value,
      });
      if (response.success) {
        ElMessage.success('关闭成功');
        // 更新线索数据（不重新打开对话框）
        updateLeadData(currentLead.value.id);
      }
    } catch (error) {
      console.error('关闭失败:', error);
    }
  });
};

// 辅助函数
const getPriorityType = (priority: string) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  };
  return typeMap[priority] || 'info';
};

const getPriorityText = (priority: string) => {
  const textMap = {
    high: '高',
    medium: '中',
    low: '低',
  };
  return textMap[priority] || priority;
};

const getStatusType = (status: string) => {
  const typeMap = {
    new: 'info',
    assigned: 'primary',
    contacting: 'warning',
    interested: 'success',
    converted: 'success',
    closed: 'danger',
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status: string) => {
  const textMap = {
    new: '新线索',
    assigned: '已分配',
    contacting: '联系中',
    interested: '意向明确',
    converted: '已转化',
    closed: '已关闭',
  };
  return textMap[status] || status;
};

const getSourceLabel = (source: string) => {
  const dictItem = leadSourceDict.value.find((item: any) => item.dictValue === source);
  return dictItem ? dictItem.dictLabel : source;
};
</script>

<style scoped>
.leads-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.lead-detail {
  padding: 10px;
}

.mt-4 {
  margin-top: 20px;
}

.mb-2 {
  margin-bottom: 10px;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.order-item-row {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
