<template>
  <div class="coupon">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>优惠券管理</span>
          <div>
            <el-input
              v-model="verifyCode"
              placeholder="请输入优惠券码进行核销"
              style="width: 300px; margin-right: 10px"
            />
            <el-button type="primary" @click="handleVerify">核销</el-button>
          </div>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="code" label="优惠券码" />
        <el-table-column prop="prizeName" label="奖品名称" />
        <el-table-column prop="prizeType" label="类型">
          <template #default="scope">
            <el-tag :type="scope.row.prizeType === 'discount' ? 'primary' : 'success'">
              {{ scope.row.prizeType === 'discount' ? '折扣券' : '赠品券' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="prizeValue" label="金额" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="过期时间" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              size="small" 
              type="success" 
              @click="handleVerifyByCoupon(scope.row)"
              :disabled="scope.row.status === 'used'"
            >
              核销
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const verifyLoading = ref(false);
const tableData = ref<any[]>([]);
const verifyCode = ref('');

// 获取优惠券列表
const getCoupons = async () => {
  loading.value = true;
  try {
    const response = await request.get('/coupons');
    tableData.value = response || [];
  } catch (error) {
    console.error('获取优惠券列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 核销优惠券
const handleVerify = async () => {
  if (!verifyCode.value) {
    ElMessage.warning('请输入优惠券码');
    return;
  }
  
  verifyLoading.value = true;
  try {
    // 查找优惠券
    const coupons = await request.get('/coupons');
    const coupon = coupons.find((c: any) => c.code === verifyCode.value);
    
    if (!coupon) {
      ElMessage.error('优惠券码不存在');
      return;
    }
    
    // 使用优惠券（使用第一个客户ID作为示例）
    await request.post(`/coupons/customer/1/use/${coupon.id}`);
    ElMessage.success('核销成功');
    verifyCode.value = '';
    getCoupons();
  } catch (error) {
    console.error('核销优惠券失败:', error);
  } finally {
    verifyLoading.value = false;
  }
};

// 通过优惠券对象核销
const handleVerifyByCoupon = async (coupon: any) => {
  verifyLoading.value = true;
  try {
    // 使用优惠券（使用第一个客户ID作为示例）
    await request.post(`/coupons/customer/1/use/${coupon.id}`);
    ElMessage.success('核销成功');
    getCoupons();
  } catch (error) {
    console.error('核销优惠券失败:', error);
  } finally {
    verifyLoading.value = false;
  }
};

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    claimed: 'success',
    used: 'info',
    expired: 'danger',
  };
  return map[status] || '';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    claimed: '未使用',
    used: '已使用',
    expired: '已过期',
  };
  return map[status] || '';
};

// 初始化
onMounted(() => {
  getCoupons();
});
</script>

<style lang="scss" scoped>
.coupon {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
