<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>销售统计</span>
          </template>
          <div class="chart-placeholder">销售图表区域</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>客户统计</span>
          </template>
          <div class="chart-placeholder">客户图表区域</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>抽奖统计</span>
          </template>
          <div class="chart-placeholder">抽奖图表区域</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>积分统计</span>
          </template>
          <div class="chart-placeholder">积分图表区域</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.statistics {
  .chart-placeholder {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    color: #999;
    font-size: 14px;
  }
}
</style>
