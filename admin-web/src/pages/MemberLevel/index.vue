<template>
  <div class="member-level">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员等级管理</span>
          <el-button type="primary" @click="handleAdd">新增等级</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="levelName" label="等级名称" width="120" />
        <el-table-column prop="levelCode" label="等级代码" width="120" />
        <el-table-column prop="minConsumption" label="消费门槛" width="120">
          <template #default="scope">
            ¥{{ scope.row.minConsumption }}
          </template>
        </el-table-column>
        <el-table-column prop="iconCode" label="等级图标" width="100">
          <template #default="scope">
            <el-icon v-if="scope.row.iconCode" :size="24" color="#409eff">
              <component :is="scope.row.iconCode" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="Boolean(scope.row.isActive) ? 'success' : 'info'">
              {{ Boolean(scope.row.isActive) ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 等级表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="form.levelName" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="等级代码" prop="levelCode">
          <el-input v-model="form.levelCode" placeholder="请输入等级代码（如：normal, silver, gold, diamond）" />
        </el-form-item>
        <el-form-item label="消费门槛" prop="minConsumption">
          <el-input-number v-model="form.minConsumption" :min="0" :precision="2" placeholder="请输入消费门槛" style="width: 100%" />
        </el-form-item>
        <el-form-item label="等级图标" prop="iconCode">
          <el-select v-model="form.iconCode" placeholder="请选择图标" style="width: 100%">
            <el-option
              v-for="icon in availableIcons"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <div style="display: flex; align-items: center;">
                <el-icon :size="18" style="margin-right: 8px;">
                  <component :is="icon" />
                </el-icon>
                <span>{{ icon }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-divider content-position="left">权益配置（暂未开放）</el-divider>
        <el-form-item label="展示文案" prop="displayText">
          <el-input v-model="form.displayText" placeholder="请输入权益展示文案（如：专属客服 | 生日礼包）" disabled />
        </el-form-item>
        <el-form-item label="积分倍数" prop="pointMultiplier">
          <el-input-number v-model="form.pointMultiplier" :min="1" :step="0.1" :precision="1" placeholder="积分倍数" style="width: 100%" disabled />
        </el-form-item>
        <el-form-item label="折扣率" prop="discountRate">
          <el-input-number v-model="form.discountRate" :min="0.1" :max="1" :step="0.01" :precision="2" placeholder="折扣率（0.9表示9折）" style="width: 100%" disabled />
        </el-form-item>
        <el-form-item label="抽奖次数" prop="lotteryTimes">
          <el-input-number v-model="form.lotteryTimes" :min="0" :step="1" placeholder="额外抽奖次数" style="width: 100%" disabled />
        </el-form-item>
        <el-divider />
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" placeholder="排序值" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 等级变更日志对话框 -->
    <el-dialog
      v-model="logDialogVisible"
      title="等级变更日志"
      width="900px"
    >
      <el-table :data="logData" style="width: 100%" v-loading="logLoading">
        <el-table-column prop="customer.customerName" label="客户姓名" width="120" />
        <el-table-column label="等级变更" width="200">
          <template #default="scope">
            <span v-if="scope.row.oldLevel">{{ scope.row.oldLevel.levelName }}</span>
            <span v-else>-</span>
            <el-icon style="margin: 0 10px;"><Right /></el-icon>
            <span>{{ scope.row.newLevel.levelName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeType" label="变更类型" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.changeType === 'auto_upgrade'" type="success">自动升级</el-tag>
            <el-tag v-else-if="scope.row.changeType === 'manual_adjust'" type="warning">手动调整</el-tag>
            <el-tag v-else-if="scope.row.changeType === 'manual_downgrade'" type="danger">手动降级</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="oldConsumption" label="变更前消费" width="100">
          <template #default="scope">
            ¥{{ scope.row.oldConsumption || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="newConsumption" label="变更后消费" width="100">
          <template #default="scope">
            ¥{{ scope.row.newConsumption || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="operator.userName" label="操作人" width="100" />
        <el-table-column prop="createdAt" label="变更时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="logDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Right } from '@element-plus/icons-vue';
import { memberLevelApi, MemberLevel, MemberLevelLog } from '../../api/member-level';

const availableIcons = [
  'User',
  'UserFilled',
  'Avatar',
  'Medal',
  'Trophy',
  'Star',
  'StarFilled',
  'Crown',
  'Diamond',
  'Sunny',
  'Moon',
  'CircleCheck',
  'CircleCheckFilled',
  'SuccessFilled',
  'Warning',
  'WarningFilled',
  'CirclePlus',
  'CirclePlusFilled',
  'Promotion',
  'TrendCharts',
  'DataAnalysis',
  'PieChart',
  'Histogram',
];

const loading = ref(false);
const tableData = ref<MemberLevel[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref();
const form = ref({
  levelId: 0,
  levelName: '',
  levelCode: '',
  minConsumption: 0,
  iconCode: '',
  displayText: '',
  pointMultiplier: 1.0,
  discountRate: 1.0,
  lotteryTimes: 0,
  sortOrder: 0,
  isActive: true,
});

const rules = {
  levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  levelCode: [{ required: true, message: '请输入等级代码', trigger: 'blur' }],
  minConsumption: [{ required: true, message: '请输入消费门槛', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
};

const logDialogVisible = ref(false);
const logLoading = ref(false);
const logData = ref<MemberLevelLog[]>([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await memberLevelApi.getAll();
    tableData.value = response.sort((a: MemberLevel, b: MemberLevel) => a.sortOrder - b.sortOrder);
  } catch (error) {
    ElMessage.error('获取等级列表失败');
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  dialogTitle.value = '新增会员等级';
  form.value = {
    levelId: 0,
    levelName: '',
    levelCode: '',
    minConsumption: 0,
    iconCode: '',
    displayText: '',
    pointMultiplier: 1.0,
    discountRate: 1.0,
    lotteryTimes: 0,
    sortOrder: 0,
    isActive: true,
  };
  dialogVisible.value = true;
};

const handleEdit = (row: MemberLevel) => {
  dialogTitle.value = '编辑会员等级';
  form.value = {
    levelId: row.levelId,
    levelName: row.levelName,
    levelCode: row.levelCode,
    minConsumption: row.minConsumption,
    iconCode: row.iconCode || '',
    displayText: row.benefitsConfig?.display_text || '',
    pointMultiplier: row.benefitsConfig?.point_multiplier || 1.0,
    discountRate: row.benefitsConfig?.discount_rate || 1.0,
    lotteryTimes: row.benefitsConfig?.lottery_times || 0,
    sortOrder: row.sortOrder,
    isActive: Boolean(row.isActive),
  };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    
    try {
      const benefitsConfig = {
        display_text: form.value.displayText,
        point_multiplier: form.value.pointMultiplier,
        discount_rate: form.value.discountRate,
        lottery_times: form.value.lotteryTimes,
      };

      const submitData: any = {
        levelName: form.value.levelName,
        levelCode: form.value.levelCode,
        minConsumption: form.value.minConsumption,
        iconCode: form.value.iconCode || undefined,
        benefitsConfig,
        sortOrder: form.value.sortOrder,
        isActive: form.value.isActive,
      };

      if (form.value.levelId) {
        await memberLevelApi.update(form.value.levelId, submitData);
        ElMessage.success('更新成功');
      } else {
        await memberLevelApi.create(submitData);
        ElMessage.success('创建成功');
      }
      
      dialogVisible.value = false;
      fetchData();
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败');
    }
  });
};

const handleDelete = (row: MemberLevel) => {
  ElMessageBox.confirm(
    `确定要删除等级"${row.levelName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await memberLevelApi.delete(row.levelId);
      ElMessage.success('删除成功');
      fetchData();
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }).catch(() => {});
};

const fetchLogs = async () => {
  logLoading.value = true;
  try {
    const response = await memberLevelApi.getLogs(undefined, 100);
    logData.value = response;
  } catch (error) {
    ElMessage.error('获取日志失败');
  } finally {
    logLoading.value = false;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

onMounted(() => {
  fetchData();
  fetchLogs();
});
</script>

<style scoped>
.member-level {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
