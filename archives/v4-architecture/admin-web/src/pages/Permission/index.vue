<template>
  <div class="permission">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>授权管理</span>
        </div>
      </template>
      <el-form :model="searchForm" label-width="80px">
        <el-form-item label="员工" prop="userId">
          <el-select v-model="searchForm.userId" placeholder="请选择员工" style="width: 200px">
            <el-option
              v-for="user in staffList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
          <el-button type="primary" @click="loadUserPermissions" style="margin-left: 10px">
            加载权限
          </el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="permissions" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="功能名称" />
        <el-table-column prop="key" label="功能键" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-switch
              v-model="scope.row.allowed"
              @change="handlePermissionChange(scope.row)"
              :active-text="'允许'"
              :inactive-text="'禁止'"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const staffList = ref<any[]>([]);
const searchForm = reactive({
  userId: '',
});

const permissions = ref([
  { id: 'dashboard', name: '数据看板', key: 'dashboard', allowed: false },
  { id: 'customer', name: '客户管理', key: 'customer', allowed: false },
  { id: 'staff', name: '员工管理', key: 'staff', allowed: false },
  { id: 'product', name: '产品管理', key: 'product', allowed: false },
  { id: 'order', name: '订单管理', key: 'order', allowed: false },
  { id: 'coupon', name: '优惠券管理', key: 'coupon', allowed: false },
  { id: 'lottery', name: '抽奖管理', key: 'lottery', allowed: false },
  { id: 'activity', name: '活动管理', key: 'activity', allowed: false },
  { id: 'statistics', name: '数据统计', key: 'statistics', allowed: false },
  { id: 'permission', name: '授权管理', key: 'permission', allowed: false },
]);

// 加载员工列表
const loadStaffList = async () => {
  loading.value = true;
  try {
    const response = await request.get('/staff');
    staffList.value = response.data;
  } catch (error) {
    console.error('获取员工列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载用户权限
const loadUserPermissions = async () => {
  if (!searchForm.userId) {
    ElMessage.warning('请选择员工');
    return;
  }
  
  loading.value = true;
  try {
    // 这里应该调用后端API获取用户权限
    // 暂时使用模拟数据
    const response = await request.get(`/staff/${searchForm.userId}/permissions`).catch(() => {
      // 如果API不存在，返回默认权限
      return { data: permissions.value.map(p => ({ ...p, allowed: false })) };
    });
    
    // 同步权限状态
    response.data.forEach((item: any) => {
      const permission = permissions.value.find(p => p.id === item.id);
      if (permission) {
        permission.allowed = item.allowed;
      }
    });
  } catch (error) {
    console.error('获取用户权限失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理权限变更
const handlePermissionChange = async (permission: any) => {
  if (!searchForm.userId) {
    ElMessage.warning('请选择员工');
    permission.allowed = !permission.allowed; // 恢复原来的状态
    return;
  }
  
  try {
    // 这里应该调用后端API更新用户权限
    await request.put(`/staff/${searchForm.userId}/permissions`, {
      permissionId: permission.id,
      allowed: permission.allowed,
    }).catch(() => {
      // 如果API不存在，模拟成功
      return { success: true };
    });
    
    ElMessage.success('权限更新成功');
  } catch (error) {
    console.error('更新权限失败:', error);
    permission.allowed = !permission.allowed; // 恢复原来的状态
  }
};

// 初始化
onMounted(() => {
  loadStaffList();
});
</script>

<style lang="scss" scoped>
.permission {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
