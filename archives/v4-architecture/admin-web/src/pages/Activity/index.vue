<template>
  <div class="activity">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" @click="handleAdd">新增活动</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="gameType" label="游戏类型">
          <template #default="scope">
            <el-tag :type="getGameTypeColor(scope.row.gameType)">
              {{ getGameTypeText(scope.row.gameType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" />
        <el-table-column prop="endDate" label="结束时间" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" @click="handleConfig(scope.row)">配置</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 活动表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="游戏类型" prop="gameType">
          <el-select v-model="form.gameType" placeholder="请选择游戏类型">
            <el-option label="老虎机" value="slot-machine" />
            <el-option label="盲盒" value="blind-box" />
            <el-option label="大转盘" value="wheel" />
            <el-option label="刮刮乐" value="scratch-card" />
            <el-option label="九宫格" value="nine-grid" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入活动描述" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">进行中</el-radio>
            <el-radio label="inactive">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 活动配置对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      title="活动配置"
      width="700px"
    >
      <el-form :model="configForm" ref="configFormRef" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="configForm.name" disabled />
        </el-form-item>
        <el-form-item label="游戏类型">
          <el-input :value="getGameTypeText(configForm.gameType)" disabled />
        </el-form-item>
        <el-divider>奖品配置</el-divider>
        <el-form-item label="添加奖品">
          <div style="width: 100%">
            <el-select v-model="selectedPrizeId" placeholder="请选择奖品" style="width: 200px; margin-right: 10px">
              <el-option
                v-for="prize in availablePrizes"
                :key="prize.id"
                :label="prize.name"
                :value="prize.id"
              />
            </el-select>
            <el-input-number v-model="selectedPrizeProbability" :min="0" :max="100" placeholder="概率(%)" style="width: 150px; margin-right: 10px" />
            <el-button type="primary" @click="addPrizeToActivity">添加</el-button>
          </div>
        </el-form-item>
        <el-table :data="configForm.prizes" style="width: 100%">
          <el-table-column prop="name" label="奖品名称" />
          <el-table-column prop="type" label="类型">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'coupon' ? 'primary' : scope.row.type === 'points' ? 'success' : 'warning'">
                {{ scope.row.type === 'coupon' ? '优惠券' : scope.row.type === 'points' ? '积分' : '礼品' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="probability" label="概率(%)" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button size="small" type="danger" @click="removePrizeFromActivity(scope.$index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveConfig" :loading="saveConfigLoading">保存配置</el-button>
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
const saveConfigLoading = ref(false);
const dialogVisible = ref(false);
const configDialogVisible = ref(false);
const dialogTitle = ref('新增活动');
const formRef = ref<FormInstance>();
const configFormRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const availablePrizes = ref<any[]>([]);
const selectedPrizeId = ref('');
const selectedPrizeProbability = ref(0);

const form = reactive({
  id: null as number | null,
  name: '',
  gameType: 'slot-machine',
  description: '',
  startDate: '',
  endDate: '',
  status: 'active',
});

const configForm = reactive({
  id: '',
  name: '',
  gameType: '',
  prizes: [] as any[],
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  gameType: [{ required: true, message: '请选择游戏类型', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'blur' }],
});

// 获取活动列表
const getActivities = async () => {
  loading.value = true;
  try {
    const response = await request.get('/activities');
    tableData.value = response || [];
  } catch (error) {
    console.error('获取活动列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取可用奖品列表
const getAvailablePrizes = async () => {
  try {
    const response = await request.get('/prizes');
    availablePrizes.value = response || [];
  } catch (error) {
    console.error('获取奖品列表失败:', error);
  }
};

// 新增活动
const handleAdd = () => {
  dialogTitle.value = '新增活动';
  Object.assign(form, {
    id: null,
    name: '',
    gameType: 'slot-machine',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });
  dialogVisible.value = true;
};

// 编辑活动
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑活动';
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 配置活动
const handleConfig = async (row: any) => {
  try {
    const response = await request.get(`/activities/${row.id}`);
    configForm.id = row.id;
    configForm.name = row.name;
    configForm.gameType = row.gameType;
    configForm.prizes = response.prizes || [];
    configDialogVisible.value = true;
  } catch (error) {
    console.error('获取活动配置失败:', error);
  }
};

// 删除活动
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该活动吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/activities/${row.id}`);
      ElMessage.success('删除成功');
      getActivities();
    } catch (error) {
      console.error('删除活动失败:', error);
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
        if (form.id) {
          await request.put(`/activities/${form.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await request.post('/activities', form);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getActivities();
      } catch (error) {
        console.error('提交表单失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 添加奖品到活动
const addPrizeToActivity = () => {
  if (!selectedPrizeId.value) {
    ElMessage.warning('请选择奖品');
    return;
  }
  if (!selectedPrizeProbability.value) {
    ElMessage.warning('请输入概率');
    return;
  }
  
  const prize = availablePrizes.value.find(p => p.id === selectedPrizeId.value);
  if (!prize) return;
  
  configForm.prizes.push({
    ...prize,
    probability: selectedPrizeProbability.value,
  });
  
  selectedPrizeId.value = '';
  selectedPrizeProbability.value = 0;
};

// 从活动移除奖品
const removePrizeFromActivity = (index: number) => {
  configForm.prizes.splice(index, 1);
};

// 保存配置
const handleSaveConfig = async () => {
  if (configForm.prizes.length === 0) {
    ElMessage.warning('请至少添加一个奖品');
    return;
  }
  
  saveConfigLoading.value = true;
  try {
    // 逐个添加奖品
    for (const prize of configForm.prizes) {
      await request.post(`/activity/${configForm.id}/prizes`, {
        prizeId: prize.id,
        probability: prize.probability,
        activityId: configForm.id
      });
    }
    
    ElMessage.success('保存成功');
    configDialogVisible.value = false;
  } catch (error) {
    console.error('保存配置失败:', error);
    ElMessage.error('保存失败');
  } finally {
    saveConfigLoading.value = false;
  }
};

// 获取游戏类型颜色
const getGameTypeColor = (type: string) => {
  const map: Record<string, any> = {
    'slot-machine': 'primary',
    'blind-box': 'success',
    'wheel': 'warning',
    'scratch-card': 'danger',
    'nine-grid': 'info',
  };
  return map[type] || '';
};

// 获取游戏类型文本
const getGameTypeText = (type: string) => {
  const map: Record<string, string> = {
    'slot-machine': '老虎机',
    'blind-box': '盲盒',
    'wheel': '大转盘',
    'scratch-card': '刮刮乐',
    'nine-grid': '九宫格',
  };
  return map[type] || '';
};

// 初始化
onMounted(() => {
  getActivities();
  getAvailablePrizes();
});
</script>

<style lang="scss" scoped>
.activity {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
