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
        <el-table-column prop="activityName" label="活动名称" />
        <el-table-column prop="activityCode" label="活动编码" />
        <el-table-column prop="activityType" label="活动类型">
          <template #default="scope">
            <el-tag :type="getActivityTypeColor(scope.row.activityType)">
              {{ scope.row.activityType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gameType" label="游戏类型">
          <template #default="scope">
            <el-tag :type="getGameTypeColor(scope.row.gameType)">
              {{ getGameTypeText(scope.row.gameType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间">
          <template #default="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
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
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型" prop="activityType">
          <el-select v-model="form.activityType" placeholder="请选择活动类型">
            <el-option label="游戏活动" value="游戏活动" />
            <el-option label="积分活动" value="积分活动" />
            <el-option label="优惠券活动" value="优惠券活动" />
            <el-option label="混合活动" value="混合活动" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动编码" prop="activityCode">
          <el-input v-model="form.activityCode" placeholder="请输入活动编码" />
        </el-form-item>
        <el-form-item label="游戏类型" prop="gameType" v-if="form.activityType === '游戏活动'" :rules="getGameTypeRules()">
          <el-radio-group v-model="form.gameType" @change="handleGameTypeChange">
            <el-radio label="slot-machine">老虎机</el-radio>
            <el-radio label="blind-box">盲盒</el-radio>
            <el-radio label="wheel">大转盘</el-radio>
            <el-radio label="scratch-card">刮刮乐</el-radio>
            <el-radio label="nine-grid">九宫格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="免费抽奖次数" prop="freeDraws" v-if="form.activityType === '游戏活动'">
          <el-input-number v-model="form.freeDraws" :min="0" :max="100" placeholder="默认3次" style="width: 100%" />
          <div class="form-tip">用户每天可免费参与的抽奖次数，免费次数用完后需要消耗积分</div>
        </el-form-item>
        <el-form-item label="积分消耗" prop="pointsCost" v-if="form.activityType === '游戏活动'">
          <el-input-number v-model="form.pointsCost" :min="0" :max="10000" placeholder="免费次数用完后每次消耗的积分" style="width: 100%" />
          <div class="form-tip">免费次数用完后，每次抽奖需要消耗的积分数</div>
        </el-form-item>
        <el-form-item label="中奖率配置" prop="winRateConfig" v-if="form.activityType === '游戏活动'">
          <div class="win-rate-config">
            <div v-for="(item, index) in form.winRateConfig" :key="index" class="win-rate-item">
              <el-select 
                v-model="item.prizeId" 
                placeholder="请选择奖品" 
                style="width: 200px; margin-right: 10px" 
                @change="(val) => handlePrizeChange(index, val)"
                clearable
              >
                <el-option label="谢谢（未中奖）" :value="0" />
                <el-option 
                  v-for="prize in prizeList" 
                  :key="prize.prizeId" 
                  :label="`${prize.prizeName} (${prize.type})`" 
                  :value="prize.prizeId" 
                />
              </el-select>
              <el-input-number v-model="item.probability" :min="0" :max="100" :precision="0" placeholder="概率%" style="width: 120px; margin-right: 10px" />
              <el-button type="danger" size="small" @click="removeWinRateItem(index)" :disabled="form.winRateConfig.length <= 2">删除</el-button>
            </div>
            <el-button type="primary" size="small" @click="addWinRateItem">添加奖品</el-button>
            <div class="win-rate-total">
              当前总概率: <span :class="{ 'error': totalWinRate !== 100 }">{{ totalWinRate }}%</span>
              <span v-if="totalWinRate !== 100" class="error-text">(总概率必须为100%)</span>
            </div>
          </div>
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
            <el-radio label="未开始">未开始</el-radio>
            <el-radio label="进行中">进行中</el-radio>
            <el-radio label="已结束">已结束</el-radio>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增活动');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const prizeList = ref<any[]>([]);

const form = reactive({
  activityId: null as number | null,
  activityName: '',
  activityCode: '',
  activityType: '游戏活动',
  gameType: 'slot-machine',
  freeDraws: 3,
  pointsCost: 10,
  description: '',
  startDate: null as Date | null,
  endDate: null as Date | null,
  status: '未开始',
  winRateConfig: [
    { prizeId: 0, name: '谢谢', probability: 50 }
  ],
});

const totalWinRate = computed(() => {
  return form.winRateConfig.reduce((sum, item) => sum + (item.probability || 0), 0);
});

const rules = reactive<FormRules>({
  activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  activityType: [{ required: true, message: '请选择活动类型', trigger: 'blur' }],
  activityCode: [{ required: true, message: '请输入活动编码', trigger: 'blur' }],
  gameType: [{ required: true, message: '请选择游戏类型', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'blur' }],
  winRateConfig: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (form.activityType === '游戏活动') {
          if (totalWinRate.value !== 100) {
            callback(new Error('总概率必须为100%'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
});

const getGameTypeRules = () => {
  if (form.activityType === '游戏活动') {
    return [{ required: true, message: '请选择游戏类型', trigger: 'blur' }];
  }
  return [];
};

const handleGameTypeChange = () => {
  if (form.activityType === '游戏活动' && (!form.winRateConfig || form.winRateConfig.length === 0)) {
    form.winRateConfig = [
      { prizeId: 0, name: '谢谢', probability: 50 }
    ];
  }
};

const addWinRateItem = () => {
  form.winRateConfig.push({ prizeId: 0, name: '', probability: 0 });
};

const removeWinRateItem = (index: number) => {
  if (form.winRateConfig.length > 2) {
    form.winRateConfig.splice(index, 1);
  }
};

const getPrizeList = async () => {
  try {
    const response = await request.get('/prizes', {
      params: {
        page: 1,
        pageSize: 1000
      }
    });
    const prizes = response?.data || [];
    prizeList.value = prizes.filter((p: any) => p.status === '可用');
    console.log('获取到的奖品列表:', prizeList.value);
  } catch (error) {
    console.error('获取奖品列表失败:', error);
    prizeList.value = [];
  }
};

const handlePrizeChange = (index: number, prizeId: number) => {
  if (prizeId === 0) {
    form.winRateConfig[index].name = '谢谢';
    form.winRateConfig[index].prizeId = 0;
  } else {
    const prize = prizeList.value.find(p => p.prizeId === prizeId);
    if (prize) {
      form.winRateConfig[index].name = prize.prizeName;
      form.winRateConfig[index].prizeId = prizeId;
    }
  }
};

// 获取活动列表
const getActivities = async () => {
  loading.value = true;
  try {
    const response = await request.get('/activities');
    tableData.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('获取活动列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 新增活动
const handleAdd = async () => {
  await getPrizeList();
  dialogTitle.value = '新增活动';
  Object.assign(form, {
    activityId: null,
    activityName: '',
    activityCode: `ACT${Date.now().toString().slice(-6)}`,
    activityType: '游戏活动',
    gameType: 'slot-machine',
    freeDraws: 3,
    pointsCost: 10,
    description: '',
    startDate: null,
    endDate: null,
    status: '未开始',
    winRateConfig: [
      { prizeId: 0, name: '谢谢', probability: 50 }
    ],
  });
  dialogVisible.value = true;
};

// 编辑活动
const handleEdit = async (row: any) => {
  await getPrizeList();
  dialogTitle.value = '编辑活动';
  Object.assign(form, {
    ...row,
    startDate: row.startTime ? new Date(row.startTime) : null,
    endDate: row.endTime ? new Date(row.endTime) : null,
    winRateConfig: row.winRateConfig || [
      { prizeId: 0, name: '谢谢', probability: 50 }
    ],
  });
  dialogVisible.value = true;
};

// 删除活动
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该活动吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/activities/${row.activityId}`);
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
        const submitData: any = { ...form };
        
        const formatDate = (date: Date | null) => {
          if (!date) return '';
          return date.toISOString();
        };
        
        submitData.startDate = formatDate(form.startDate);
        submitData.endDate = formatDate(form.endDate);
        
        if (form.activityId) {
          const allowedFields = ['activityName', 'activityCode', 'activityType', 'gameType', 'freeDraws', 'pointsCost', 'description', 'startDate', 'endDate', 'status', 'maxParticipants', 'maxDrawsPerUser', 'minPoints', 'imageUrl', 'winRateConfig'];
          const filteredData: any = {};
          allowedFields.forEach(field => {
            const value = submitData[field as keyof typeof submitData];
            if (value !== undefined && value !== null && value !== '') {
              filteredData[field] = value;
            }
          });
          await request.put(`/activities/${form.activityId}`, filteredData);
          ElMessage.success('更新成功');
        } else {
          const { activityId, ...dataWithoutId } = submitData;
          await request.post('/activities', dataWithoutId);
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

// 获取活动类型颜色
const getActivityTypeColor = (type: string) => {
  const map: Record<string, any> = {
    '游戏活动': 'primary',
    '积分活动': 'success',
    '优惠券活动': 'warning',
    '混合活动': 'danger',
  };
  return map[type] || '';
};

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '未开始': 'info',
    '进行中': 'success',
    '已结束': 'danger',
  };
  return map[status] || '';
};

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  getPrizeList();
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

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.5;
  }

  .win-rate-config {
    width: 100%;

    .win-rate-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .win-rate-total {
      margin-top: 15px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 14px;

      span {
        font-weight: bold;
        font-size: 16px;
        margin-left: 5px;

        &.error {
          color: #f56c6c;
        }
      }

      .error-text {
        color: #f56c6c;
        margin-left: 10px;
        font-size: 12px;
      }
    }
  }
}
</style>
