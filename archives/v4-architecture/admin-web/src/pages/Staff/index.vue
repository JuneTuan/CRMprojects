<template>
  <div class="staff">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>员工管理</span>
          <el-button type="primary" @click="handleAdd">新增员工</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="position" label="职位" />
        <el-table-column prop="isActive" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="scope.row.isActive ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 员工表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
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
const dialogTitle = ref('新增员工');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);

const form = reactive({
  id: null as number | null,
  username: '',
  name: '',
  phone: '',
  position: '',
  password: '',
});

const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// 获取员工列表
const getStaffList = async () => {
  loading.value = true;
  try {
    const response = await request.get('/staff');
    tableData.value = response || [];
  } catch (error) {
    console.error('获取员工列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 新增员工
const handleAdd = () => {
  dialogTitle.value = '新增员工';
  Object.assign(form, {
    id: null,
    username: '',
    name: '',
    phone: '',
    position: '',
    password: '',
  });
  dialogVisible.value = true;
};

// 编辑员工
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑员工';
  Object.assign(form, {
    id: row.id,
    username: row.username,
    name: row.name,
    phone: row.phone || '',
    position: row.position || '',
    password: '',
  });
  dialogVisible.value = true;
};

// 切换员工状态
const handleToggleStatus = async (row: any) => {
  try {
    await request.put(`/staff/${row.id}/toggle`);
    ElMessage.success('状态更新成功');
    getStaffList();
  } catch (error) {
    console.error('切换员工状态失败:', error);
  }
};

// 删除员工
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该员工吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/staff/${row.id}`);
      ElMessage.success('删除成功');
      getStaffList();
    } catch (error) {
      console.error('删除员工失败:', error);
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
          await request.put(`/staff/${form.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await request.post('/staff', form);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getStaffList();
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
  getStaffList();
});
</script>

<style lang="scss" scoped>
.staff {
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
