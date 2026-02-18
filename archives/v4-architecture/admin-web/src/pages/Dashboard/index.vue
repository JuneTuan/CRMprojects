<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" v-loading="loading">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '@/api';

const loading = ref(false);
const stats = ref([
  { title: '客户总数', value: 0, icon: 'User', color: '#409eff' },
  { title: '订单总数', value: 0, icon: 'Document', color: '#67c23a' },
  { title: '优惠券使用', value: 0, icon: 'Ticket', color: '#e6a23c' },
  { title: '抽奖次数', value: 0, icon: 'Present', color: '#f56c6c' },
]);

// 获取统计数据
const getStats = async () => {
  loading.value = true;
  try {
    const response = await request.get('/dashboard/stats');
    
    if (response) {
      stats.value[0].value = response.customers?.total || 0;
      stats.value[1].value = response.orders?.total || 0;
      stats.value[2].value = response.coupons?.total || 0;
      stats.value[3].value = response.lottery?.totalRecords || 0;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  getStats();
});
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    margin-bottom: 20px;

    .stat-content {
      display: flex;
      align-items: center;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;

        .el-icon {
          font-size: 30px;
          color: #fff;
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }

        .stat-title {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
}
</style>
