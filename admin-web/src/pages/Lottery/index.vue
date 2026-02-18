<template>
  <div class="lottery">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>抽奖管理</span>
          <el-button type="primary" @click="handleAdd">新增奖品</el-button>
        </div>
      </template>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入奖品名称或描述"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          style="width: 300px; margin-right: 10px"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="prizeName" label="奖品名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="价值" width="100">
          <template #default="scope">
            {{ formatValue(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="总数量" width="100" />
        <el-table-column prop="remainingQuantity" label="剩余数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '可用' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="奖品名称" prop="prizeName">
          <el-input v-model="form.prizeName" placeholder="请输入奖品名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" @change="handleTypeChange">
            <el-option label="券" value="券" />
            <el-option label="实物" value="实物" />
            <el-option label="积分" value="积分" />
          </el-select>
        </el-form-item>
        <el-form-item label="价值" prop="value" v-if="form.type !== '券'">
          <el-input-number v-model="form.value" :min="0" :precision="0" placeholder="请输入价值" />
          <span style="margin-left: 10px; color: #999;">{{ form.type === '积分' ? '积分' : '元' }}</span>
        </el-form-item>
        <el-form-item label="总数量" prop="quantity" v-if="form.type !== '券'">
          <el-input-number v-model="form.quantity" :min="1" placeholder="请输入总数量" />
        </el-form-item>
        <el-form-item label="剩余数量" prop="remainingQuantity" v-if="form.type !== '券'">
          <el-input-number v-model="form.remainingQuantity" :min="0" placeholder="请输入剩余数量" />
        </el-form-item>
        <el-form-item label="可用券数" v-if="form.type === '券'">
          <span>{{ form.quantity }}</span>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="可用" value="可用" />
            <el-option label="不可用" value="不可用" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增奖品');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const searchKeyword = ref('');
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const form = reactive({
  prizeId: null as number | null,
  prizeName: '',
  type: '实物',
  value: 0,
  quantity: 100,
  remainingQuantity: 100,
  description: '',
  status: '可用',
});

const rules = reactive<FormRules>({
  prizeName: [{ required: true, message: '请输入奖品名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入价值', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入总数量', trigger: 'blur' }],
  remainingQuantity: [{ required: true, message: '请输入剩余数量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
});

const getPrizes = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }
    const response = await request.get('/prizes', { params });
    tableData.value = response.data || [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error('获取奖品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  getPrizes();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  getPrizes();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  getPrizes();
};

const getCoupons = async () => {
  try {
    const response = await request.get('/coupons');
    return response.data || [];
  } catch (error) {
    console.error('获取券列表失败:', error);
    return [];
  }
};

const handleAdd = async () => {
  dialogTitle.value = '新增奖品';
  Object.assign(form, {
    prizeId: null,
    prizeName: '',
    type: '实物',
    value: 0,
    quantity: 100,
    remainingQuantity: 100,
    description: '',
    status: '可用',
  });
  
  if (form.type === '券') {
    const coupons = await getCoupons();
    const totalQuantity = coupons.reduce((sum: number, coupon: any) => sum + coupon.remainingQuantity, 0);
    form.quantity = totalQuantity;
    form.remainingQuantity = totalQuantity;
  }
  
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑奖品';
  Object.assign(form, {
    prizeId: row.prizeId,
    prizeName: row.prizeName,
    type: row.type,
    value: row.value,
    quantity: row.quantity,
    remainingQuantity: row.remainingQuantity,
    description: row.description,
    status: row.status,
  });
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该奖品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/prizes/${row.prizeId}`);
      ElMessage.success('删除成功');
      getPrizes();
    } catch (error) {
      console.error('删除奖品失败:', error);
    }
  });
};

const handleTypeChange = async () => {
    if (form.type === '券') {
      form.value = 0;
      const coupons = await getCoupons();
      const totalQuantity = coupons.reduce((sum: number, coupon: any) => sum + coupon.remainingQuantity, 0);
      form.quantity = totalQuantity;
      form.remainingQuantity = totalQuantity;
    } else {
      form.value = 0;
      form.quantity = 100;
      form.remainingQuantity = 100;
    }
  };

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const prizeData: any = {
          prizeName: form.prizeName,
          type: form.type,
          description: form.description,
          status: form.status,
        };

        if (form.type !== '券') {
          prizeData.quantity = form.quantity;
          prizeData.remainingQuantity = form.remainingQuantity;
          prizeData.value = form.value;
        } else {
          prizeData.quantity = 999999;
          prizeData.remainingQuantity = 999999;
        }

        if (form.prizeId) {
          await request.put(`/prizes/${form.prizeId}`, prizeData);
          ElMessage.success('更新成功');
        } else {
          await request.post('/prizes', prizeData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getPrizes();
      } catch (error) {
        console.error('提交表单失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const getTypeType = (type: string) => {
  const map: Record<string, any> = {
    '券': 'primary',
    '实物': 'success',
    '积分': 'warning',
  };
  return map[type] || '';
};

const getTypeText = (type: string) => {
  return type;
};

const formatValue = (row: any) => {
  if (row.type === '券') {
    return '优惠券';
  } else if (row.type === '积分') {
    return `${row.value}积分`;
  } else {
    return `¥${row.value}`;
  }
};

onMounted(() => {
  getPrizes();
});
</script>

<style lang="scss" scoped>
.lottery {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-bar {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>