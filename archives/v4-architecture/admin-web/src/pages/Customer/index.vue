<template>
  <div class="customer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button type="primary" @click="handleAdd">新增客户</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="points" label="积分" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 客户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number v-model="form.points" :min="0" placeholder="请输入积分" />
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
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增客户');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);

const form = reactive({
  id: null as number | null,
  name: '',
  phone: '',
  email: '',
  points: 0,
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }],
  points: [{ required: true, message: '请输入积分', trigger: 'blur' }],
});

// 获取客户列表
const getCustomers = async () => {
  loading.value = true;
  try {
    const response = await request.get('/customers');
    tableData.value = response || [];
  } catch (error) {
    console.error('获取客户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 新增客户
const handleAdd = () => {
  dialogTitle.value = '新增客户';
  Object.assign(form, {
    id: '',
    name: '',
    phone: '',
    email: '',
    points: 0,
  });
  dialogVisible.value = true;
};

// 编辑客户
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑客户';
  Object.assign(form, row);
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
        await request.delete(`/customers/${row.id}`);
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
        if (form.id) {
          await request.put(`/customers/${form.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await request.post('/customers', form);
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

// 初始化
onMounted(() => {
  getCustomers();
});
</script>

<style lang="scss" scoped>
.customer {
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
