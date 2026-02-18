<template>
  <div class="role">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="userCount" label="用户数量" />
        <el-table-column prop="permissionCount" label="权限数量" />
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="handlePermissions(scope.row)">权限配置</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限配置"
      width="600px"
    >
      <div v-loading="permissionLoading">
        <el-checkbox-group v-model="selectedPermissions">
          <el-checkbox
            v-for="permission in allPermissions"
            :key="permission.permissionId"
            :label="permission.permissionId"
          >
            {{ permission.permissionName }} - {{ permission.description }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermissions" :loading="savePermissionLoading">保存</el-button>
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
const permissionLoading = ref(false);
const savePermissionLoading = ref(false);
const dialogVisible = ref(false);
const permissionDialogVisible = ref(false);
const dialogTitle = ref('新增角色');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const allPermissions = ref<any[]>([]);
const selectedPermissions = ref<number[]>([]);
const currentRole = ref<any>(null);

const form = reactive({
  id: null as number | null,
  roleName: '',
  description: '',
});

const rules = reactive<FormRules>({
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: false, message: '请输入角色描述', trigger: 'blur' }],
});

// 获取角色列表
const getRoleList = async () => {
  loading.value = true;
  try {
    const response: any = await request.get('/roles');
    tableData.value = (response || []).map((role: any) => ({
      id: role.roleId,
      roleName: role.roleName,
      description: role.description,
      userCount: role.userCount || 0,
      permissionCount: role.rolePermissions?.length || 0,
    }));
  } catch (error) {
    console.error('获取角色列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取所有权限
const getAllPermissions = async () => {
  try {
    const response: any = await request.get('/permissions');
    allPermissions.value = response || [];
  } catch (error) {
    console.error('获取权限列表失败:', error);
  }
};

// 新增角色
const handleAdd = () => {
  dialogTitle.value = '新增角色';
  Object.assign(form, {
    id: null,
    roleName: '',
    description: '',
  });
  dialogVisible.value = true;
};

// 编辑角色
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑角色';
  Object.assign(form, {
    id: row.id,
    roleName: row.roleName,
    description: row.description,
  });
  dialogVisible.value = true;
};

// 权限配置
const handlePermissions = async (row: any) => {
  currentRole.value = row;
  permissionLoading.value = true;
  permissionDialogVisible.value = true;
  
  try {
    const response: any = await request.get(`/roles/${row.id}`);
    const rolePermissions = response.rolePermissions || [];
    selectedPermissions.value = rolePermissions.map((rp: any) => rp.permissionId);
  } catch (error) {
    console.error('获取角色权限失败:', error);
    selectedPermissions.value = [];
  } finally {
    permissionLoading.value = false;
  }
};

// 保存权限配置
const handleSavePermissions = async () => {
  if (!currentRole.value) return;
  
  savePermissionLoading.value = true;
  try {
    await request.put(`/roles/${currentRole.value.id}/permissions`, {
      permissionIds: selectedPermissions.value
    });
    ElMessage.success('权限配置成功');
    permissionDialogVisible.value = false;
    getRoleList();
  } catch (error) {
    console.error('保存权限配置失败:', error);
  } finally {
    savePermissionLoading.value = false;
  }
};

// 删除角色
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该角色吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/roles/${row.id}`);
      ElMessage.success('删除成功');
      getRoleList();
    } catch (error) {
      console.error('删除角色失败:', error);
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
          await request.put(`/roles/${form.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await request.post('/roles', form);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getRoleList();
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
  getRoleList();
  getAllPermissions();
});
</script>

<style lang="scss" scoped>
.role {
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

  .el-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
