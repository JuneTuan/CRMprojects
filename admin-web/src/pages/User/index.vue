<template>
  <div class="user">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="position" label="职位" />
        <el-table-column prop="roleName" label="角色" />
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

    <!-- 用户表单对话框 -->
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
          <el-select v-model="form.position" placeholder="请选择职位" style="width: 100%">
            <el-option
              v-for="position in positionOptions"
              :key="position"
              :label="position"
              :value="position"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
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
const dialogTitle = ref('新增用户');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

const form = reactive({
  id: null as number | null,
  username: '',
  name: '',
  phone: '',
  position: '',
  roleId: null as number | null,
  password: '',
});

const positionOptions = [
  '销售经理',
  '销售主管',
  '销售专员',
  '客服经理',
  '客服专员',
  '运营经理',
  '运营专员',
  '市场经理',
  '市场专员',
  '产品经理',
  '产品专员',
  '技术经理',
  '技术专员',
  '财务经理',
  '财务专员',
  '人事经理',
  '人事专员',
  '行政经理',
  '行政专员',
  '其他',
];

const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  position: [{ required: true, message: '请选择职位', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// 获取角色列表
const getRoleList = async () => {
  try {
    const response: any = await request.get('/roles');
    roleOptions.value = (response || []).map((role: any) => ({
      id: role.roleId,
      roleName: role.roleName,
    }));
  } catch (error) {
    console.error('获取角色列表失败:', error);
  }
};

// 获取用户列表
const getUserList = async () => {
  loading.value = true;
  try {
    const response = await request.get('/users');
    console.log('获取用户列表响应:', response);
    tableData.value = (response || []).map((user: any) => ({
      id: user.userId,
      username: user.username,
      name: user.userName,
      phone: user.phone,
      position: user.position,
      roleId: user.roleId,
      roleName: user.role?.roleName || '未分配',
      isActive: user.isActive,
    }));
    console.log('映射后的表格数据:', tableData.value);
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 新增用户
const handleAdd = () => {
  dialogTitle.value = '新增用户';
  Object.assign(form, {
    id: null,
    username: '',
    name: '',
    phone: '',
    position: '',
    roleId: null,
    password: '',
  });
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑用户';
  Object.assign(form, {
    id: row.id,
    username: row.username,
    name: row.name,
    phone: row.phone || '',
    position: row.position || '',
    roleId: row.roleId || null,
    password: '',
  });
  dialogVisible.value = true;
};

// 切换用户状态
const handleToggleStatus = async (row: any) => {
  try {
    await request.put(`/users/${row.id}/toggle`);
    ElMessage.success('状态更新成功');
    getUserList();
  } catch (error) {
    console.error('切换用户状态失败:', error);
  }
};

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该用户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/users/${row.id}`);
      ElMessage.success('删除成功');
      getUserList();
    } catch (error) {
      console.error('删除用户失败:', error);
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
          await request.put(`/users/${form.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await request.post('/users', form);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getUserList();
        ElMessage.success(form.id ? '更新成功' : '新增成功');
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
  getUserList();
  getRoleList();
});
</script>

<style lang="scss" scoped>
.user {
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
