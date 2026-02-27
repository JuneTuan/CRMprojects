<template>
  <div class="customer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button type="primary" @click="handleAdd">新增客户</el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索姓名、用户名、手机号或邮箱"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          style="width: 300px"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        @sort-change="handleSortChange"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
      >
        <el-table-column prop="customerName" label="姓名" sortable="custom" />
        <el-table-column prop="customerCode" label="用户名" sortable="custom" />
        <el-table-column prop="phone" label="手机号" sortable="custom" />
        <el-table-column prop="email" label="邮箱" sortable="custom" />
        <el-table-column prop="level" label="会员等级" sortable="custom" />
        <el-table-column prop="points" label="积分" sortable="custom" />
        <el-table-column prop="source" label="来源" sortable="custom">
          <template #default="scope">
            {{ getSourceLabel(scope.row.source) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="负责人">
          <template #default="scope">
            {{ scope.row.owner?.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="handleViewPoints(scope.row)">查看积分</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 客户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择会员等级">
            <el-option label="普通会员" value="普通会员" />
            <el-option label="白银会员" value="白银会员" />
            <el-option label="黄金会员" value="黄金会员" />
            <el-option label="钻石会员" value="钻石会员" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源" prop="source">
          <el-select v-model="form.source" placeholder="请选择来源" clearable>
            <el-option
              v-for="item in customerSourceDict"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="积分" prop="points" v-if="form.customerId">
          <el-input-number v-model="form.points" :disabled="true" placeholder="积分" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="负责人" prop="ownerId">
          <el-select v-model="form.ownerId" placeholder="请选择负责人" clearable>
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
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 积分记录对话框 -->
    <el-dialog
      v-model="pointsDialogVisible"
      title="积分记录"
      width="800px"
    >
      <el-table :data="pointsData" style="width: 100%" v-loading="pointsLoading">
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="points" label="积分变化">
          <template #default="scope">
            <span :style="{ color: scope.row.points > 0 ? '#67c23a' : '#f56c6c' }">
              {{ scope.row.points > 0 ? '+' : '' }}{{ scope.row.points }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" />
        <el-table-column prop="reason" label="原因" />
        <el-table-column prop="createdAt" label="时间">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pointsCurrentPage"
          v-model:page-size="pointsPageSize"
          :page-sizes="[10, 20, 50]"
          :total="pointsTotal"
          layout="total, sizes, prev, pager, next"
          @size-change="handlePointsSizeChange"
          @current-change="handlePointsCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';
import { dictionaryApi } from '@/api/dictionary';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增客户');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const users = ref<any[]>([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const customerSourceDict = ref<any[]>([]);

// 排序相关
const sortProp = ref('createdAt');
const sortOrder = ref('descending');

const pointsDialogVisible = ref(false);
const pointsLoading = ref(false);
const pointsData = ref<any[]>([]);
const pointsCurrentPage = ref(1);
const pointsPageSize = ref(10);
const pointsTotal = ref(0);
const currentCustomerId = ref<number | null>(null);

const form = reactive({
  customerId: null as number | null,
  customerName: '',
  customerCode: '',
  phone: '',
  email: '',
  level: '普通会员',
  points: 0,
  source: 'backend',
  remark: '',
  ownerId: null as number | null,
});

const rules = reactive<FormRules>({
  customerName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号（以1开头，共11位）', trigger: 'blur' }
  ],
  email: [{ type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }],
  level: [{ required: true, message: '请选择会员等级', trigger: 'change' }],
});

// 获取客户列表
const getCustomers = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    if (searchKeyword.value) {
      params.search = searchKeyword.value;
    }
    if (sortProp.value) {
      params.sort = sortProp.value;
      params.order = sortOrder.value === 'ascending' ? 'ASC' : 'DESC';
    }
    const response: any = await request.get('/api/v6/customers', { params });
    tableData.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error('获取客户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortProp.value = prop || 'createdAt';
  sortOrder.value = order || 'descending';
  getCustomers();
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getCustomers();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getCustomers();
};

// 当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getCustomers();
};

// 获取员工列表
const getUsers = async () => {
  try {
    const response: any = await request.get('/users');
    console.log('获取员工列表原始响应:', response);
    console.log('员工列表数据:', response.data || response);
    users.value = Array.isArray(response) ? response : (response.data || []);
    console.log('设置后的users.value:', users.value);
  } catch (error) {
    console.error('获取员工列表失败:', error);
  }
};

// 获取管理员用户ID
const getAdminUserId = () => {
  const adminUser = users.value.find(user => 
    user.role?.roleName?.includes('管理员') || 
    user.username === 'admin'
  );
  return adminUser ? adminUser.userId : (users.value[0]?.userId || null);
};

// 新增客户
const handleAdd = () => {
  dialogTitle.value = '新增客户';
  const adminUserId = getAdminUserId();
  Object.assign(form, {
    customerId: null,
    customerName: '',
    customerCode: '',
    phone: '',
    email: '',
    level: '普通会员',
    points: 0,
    source: 'backend',
    remark: '',
    ownerId: adminUserId,
  });
  dialogVisible.value = true;
};

// 编辑客户
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑客户';
  Object.assign(form, {
    customerId: row.customerId,
    customerName: row.customerName,
    customerCode: row.customerCode,
    phone: row.phone,
    email: row.email,
    level: row.level,
    points: Number(row.points) || 0,
    source: row.source || 'backend',
    remark: row.remark || '',
    ownerId: row.owner?.userId || null,
  });
  dialogVisible.value = true;
};

// 删除客户
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该客户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
        await request.delete(`/api/v6/customers/${row.customerId}`);
        ElMessage.success('删除成功');
        getCustomers();
      } catch (error) {
        console.error('删除客户失败:', error);
      }
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const { customerId, ...data } = form;
        // 确保 source 有值，默认为 backend
        if (!data.source) {
          data.source = 'backend';
        }
        if (form.customerId) {
          await request.put(`/api/v6/customers/${form.customerId}`, data);
          ElMessage.success('更新成功');
        } else {
          await request.post('/api/v6/customers', data);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getCustomers();
      } catch (error) {
        console.error('提交表单失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 查看积分记录
const handleViewPoints = async (row: any) => {
  currentCustomerId.value = row.customerId;
  pointsDialogVisible.value = true;
  await getPointsRecords();
};

// 获取积分记录
const getPointsRecords = async () => {
  if (!currentCustomerId.value) return;
  pointsLoading.value = true;
  try {
    const response: any = await request.get(`/points-records/customer/${currentCustomerId.value}`, {
      params: {
        page: pointsCurrentPage.value,
        limit: pointsPageSize.value,
      },
    });
    pointsData.value = response.data || [];
    pointsTotal.value = response.total || 0;
  } catch (error) {
    console.error('获取积分记录失败:', error);
  } finally {
    pointsLoading.value = false;
  }
};

// 积分记录分页
const handlePointsSizeChange = (size: number) => {
  pointsPageSize.value = size;
  pointsCurrentPage.value = 1;
  getPointsRecords();
};

const handlePointsCurrentChange = (page: number) => {
  pointsCurrentPage.value = page;
  getPointsRecords();
};

// 获取客户来源字典
const getCustomerSourceDict = async () => {
  try {
    const response: any = await dictionaryApi.getByType('customer_source');
    customerSourceDict.value = response || [];
  } catch (error) {
    console.error('获取客户来源字典失败:', error);
  }
};

// 获取来源标签
const getSourceLabel = (source: string) => {
  const dictItem = customerSourceDict.value.find(item => item.dictValue === source);
  return dictItem ? dictItem.dictLabel : source;
};

// 初始化
onMounted(() => {
  getCustomers();
  getUsers();
  getCustomerSourceDict();
});
</script>

<style lang="scss" scoped>
.customer {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .dialog-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
