<template>
  <div class="lottery">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>抽奖管理</span>
          <el-button type="primary" @click="handleAdd">新增奖品</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="奖品名称" />
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            <el-tag :type="getTypeType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="价值" />
        <el-table-column prop="probability" label="概率(%)" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 奖品表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="奖品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入奖品名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="优惠券" value="coupon" />
            <el-option label="积分" value="points" />
            <el-option label="礼品" value="gift" />
          </el-select>
        </el-form-item>
        <el-form-item label="价值" prop="value">
          <el-input-number v-model="form.value" :min="0" placeholder="请输入价值" />
        </el-form-item>
        <el-form-item label="概率(%)" prop="probability">
          <el-input-number v-model="form.probability" :min="0" :max="100" placeholder="请输入概率" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" placeholder="请输入库存" />
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

const form = reactive({
  id: null as number | null,
  name: '',
  type: 'coupon',
  value: 0,
  probability: 0,
  stock: 0,
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入奖品名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'blur' }],
  value: [{ required: true, message: '请输入价值', trigger: 'blur' }],
  probability: [{ required: true, message: '请输入概率', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
});

// 获取奖品列表
const getPrizes = async () => {
  loading.value = true;
  try {
    const response = await request.get('/prizes');
    tableData.value = response || [];
  } catch (error) {
    console.error('获取奖品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 新增奖品
const handleAdd = () => {
  dialogTitle.value = '新增奖品';
  Object.assign(form, {
    id: null,
    name: '',
    type: 'coupon',
    value: 0,
    probability: 0,
    stock: 0,
  });
  dialogVisible.value = true;
};

// 编辑奖品
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑奖品';
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 删除奖品
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该奖品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/prizes/${row.id}`);
      ElMessage.success('删除成功');
      getPrizes();
    } catch (error) {
      console.error('删除奖品失败:', error);
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
          await request.put(`/prizes/${form.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await request.post('/prizes', form);
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

// 获取类型样式
const getTypeType = (type: string) => {
  const map: Record<string, any> = {
    coupon: 'primary',
    points: 'success',
    gift: 'warning',
  };
  return map[type] || '';
};

// 获取类型文本
const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    coupon: '优惠券',
    points: '积分',
    gift: '礼品',
  };
  return map[type] || '';
};

// 初始化
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

  .dialog-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
