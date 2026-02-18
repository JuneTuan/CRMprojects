<template>
  <div class="statistics">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="24">
        <el-card>
          <div class="filter-bar">
            <div class="filter-item">
              <span class="filter-label">时间范围：</span>
              <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
                <el-radio-button label="7">最近7天</el-radio-button>
                <el-radio-button label="30">最近30天</el-radio-button>
                <el-radio-button label="90">最近90天</el-radio-button>
                <el-radio-button label="custom">自定义</el-radio-button>
              </el-radio-group>
            </div>
            <div class="filter-item" v-if="timeRange === 'custom'">
              <el-date-picker
                v-model="customDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleCustomDateChange"
              />
            </div>
            <div class="filter-item">
              <el-button type="primary" @click="loadAllData">刷新数据</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon customer-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.customerCount }}</div>
              <div class="stat-label">客户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon order-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.orderCount }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon sales-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ Number(overview.totalSales || 0).toFixed(2) }}</div>
              <div class="stat-label">总销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon lottery-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalLotteryDraws }}</div>
              <div class="stat-label">抽奖次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售统计</span>
              <el-radio-group v-model="salesDimension" size="small" @change="handleSalesDimensionChange">
                <el-radio-button label="time">时间趋势</el-radio-button>
                <el-radio-button label="status">状态分布</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="salesChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>客户统计</span>
              <el-radio-group v-model="customerDimension" size="small" @change="handleCustomerDimensionChange">
                <el-radio-button label="time">增长趋势</el-radio-button>
                <el-radio-button label="points">积分分布</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="customerChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>抽奖统计</span>
              <el-radio-group v-model="lotteryDimension" size="small" @change="handleLotteryDimensionChange">
                <el-radio-button label="time">时间趋势</el-radio-button>
                <el-radio-button label="prize">奖品分布</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="lotteryChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>积分统计</span>
              <el-radio-group v-model="pointsDimension" size="small" @change="handlePointsDimensionChange">
                <el-radio-button label="time">时间趋势</el-radio-button>
                <el-radio-button label="type">类型分布</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="pointsChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活动统计</span>
              <el-radio-group v-model="activityDimension" size="small" @change="handleActivityDimensionChange">
                <el-radio-button label="status">状态分布</el-radio-button>
                <el-radio-button label="type">类型分布</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="activityChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>奖品统计</span>
              <el-radio-group v-model="prizeDimension" size="small" @change="handlePrizeDimensionChange">
                <el-radio-button label="type">类型分布</el-radio-button>
                <el-radio-button label="usage">使用情况</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="prizeChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>优惠券统计</span>
              <el-radio-group v-model="couponDimension" size="small" @change="handleCouponDimensionChange">
                <el-radio-button label="status">状态分布</el-radio-button>
                <el-radio-button label="type">类型分布</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="couponChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { User, ShoppingCart, Money, Trophy } from '@element-plus/icons-vue'
import request from '@/api'
import { ElMessage } from 'element-plus'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const timeRange = ref('30')
const customDateRange = ref<any[]>([])
const salesDimension = ref('time')
const customerDimension = ref('time')
const lotteryDimension = ref('time')
const pointsDimension = ref('time')
const activityDimension = ref('status')
const prizeDimension = ref('type')
const couponDimension = ref('status')

const overview = ref({
  customerCount: 0,
  orderCount: 0,
  totalSales: 0,
  totalLotteryDraws: 0
})

const salesStatistics = ref<any>({})
const customerStatistics = ref<any>({})
const lotteryStatistics = ref<any>({})
const activityStatistics = ref<any>({})
const prizeStatistics = ref<any>({})
const pointsStatistics = ref<any>({})
const couponStatistics = ref<any>({})

const salesChartOption = ref<any>({})
const customerChartOption = ref<any>({})
const lotteryChartOption = ref<any>({})
const pointsChartOption = ref<any>({})
const activityChartOption = ref<any>({})
const prizeChartOption = ref<any>({})
const couponChartOption = ref<any>({})

const getDateRange = () => {
  const now = new Date()
  let startDate: Date

  if (timeRange.value === 'custom' && customDateRange.value && customDateRange.value.length === 2) {
    return {
      startDate: customDateRange.value[0],
      endDate: customDateRange.value[1]
    }
  }

  const days = parseInt(timeRange.value as string)
  startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return {
    startDate,
    endDate: now
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const loadOverview = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/overview', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }) as any
    overview.value = response
  } catch (error) {
    console.error('加载概览数据失败:', error)
  }
}

const loadSalesStatistics = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/sales', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dimension: salesDimension.value
      }
    }) as any
    salesStatistics.value = response

    if (salesDimension.value === 'time') {
      salesChartOption.value = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['销售额']
        },
        xAxis: {
          type: 'category',
          data: response.dailySales?.map((item: any) => formatDate(item.date)) || []
        },
        yAxis: {
          type: 'value',
          name: '销售额(元)'
        },
        series: [
          {
            name: '销售额',
            type: 'line',
            data: response.dailySales?.map((item: any) => item.sales) || [],
            smooth: true
          }
        ]
      }
    } else {
      salesChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: '50%',
            data: response.orderStatusDistribution?.map((item: any) => ({
              name: item.status,
              value: item.count
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  } catch (error) {
    console.error('加载销售统计失败:', error)
  }
}

const loadCustomerStatistics = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/customers', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dimension: customerDimension.value
      }
    }) as any
    customerStatistics.value = response

    if (customerDimension.value === 'time') {
      customerChartOption.value = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['新增客户']
        },
        xAxis: {
          type: 'category',
          data: response.customerGrowth?.map((item: any) => formatDate(item.date)) || []
        },
        yAxis: {
          type: 'value',
          name: '客户数'
        },
        series: [
          {
            name: '新增客户',
            type: 'bar',
            data: response.customerGrowth?.map((item: any) => item.count) || []
          }
        ]
      }
    } else {
      customerChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '积分分布',
            type: 'pie',
            radius: '50%',
            data: response.pointsDistribution?.map((item: any) => ({
              name: `${item.pointsRange}-${parseInt(item.pointsRange) + 100}`,
              value: item.count
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  } catch (error) {
    console.error('加载客户统计失败:', error)
  }
}

const loadLotteryStatistics = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/lottery', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dimension: lotteryDimension.value
      }
    }) as any
    lotteryStatistics.value = response

    if (lotteryDimension.value === 'time') {
      lotteryChartOption.value = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['抽奖次数']
        },
        xAxis: {
          type: 'category',
          data: response.dailyDraws?.map((item: any) => formatDate(item.date)) || []
        },
        yAxis: {
          type: 'value',
          name: '次数'
        },
        series: [
          {
            name: '抽奖次数',
            type: 'line',
            data: response.dailyDraws?.map((item: any) => item.draws) || [],
            smooth: true
          }
        ]
      }
    } else {
      lotteryChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '奖品分布',
            type: 'pie',
            radius: '50%',
            data: response.prizeWinDistribution?.map((item: any) => ({
              name: item.prizeName,
              value: item.count
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  } catch (error) {
    console.error('加载抽奖统计失败:', error)
  }
}

const loadActivityStatistics = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/activities', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dimension: activityDimension.value
      }
    }) as any
    activityStatistics.value = response

    if (activityDimension.value === 'status') {
      activityChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '活动状态',
            type: 'pie',
            radius: '50%',
            data: response.activityStatusDistribution?.map((item: any) => ({
              name: item.status,
              value: item.count
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    } else {
      activityChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '活动类型',
            type: 'pie',
            radius: '50%',
            data: response.activityTypeDistribution?.map((item: any) => ({
              name: item.activityType,
              value: item.count
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  } catch (error) {
    console.error('加载活动统计失败:', error)
  }
}

const loadPrizeStatistics = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/prizes', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dimension: prizeDimension.value
      }
    }) as any
    prizeStatistics.value = response

    if (prizeDimension.value === 'type') {
      prizeChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '奖品类型',
            type: 'pie',
            radius: '50%',
            data: response.prizeTypeDistribution?.map((item: any) => ({
              name: item.type,
              value: item.totalQuantity
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    } else {
      prizeChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '奖品使用情况',
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { name: '已使用', value: response.totalUsed || 0 },
              { name: '剩余', value: response.totalRemaining || 0 }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  } catch (error) {
    console.error('加载奖品统计失败:', error)
  }
}

const loadPointsStatistics = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/points', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dimension: pointsDimension.value
      }
    }) as any
    pointsStatistics.value = response

    if (pointsDimension.value === 'time') {
      pointsChartOption.value = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['发放积分', '消费积分']
        },
        xAxis: {
          type: 'category',
          data: response.dailyPointsIssued?.map((item: any) => formatDate(item.date)) || []
        },
        yAxis: {
          type: 'value',
          name: '积分'
        },
        series: [
          {
            name: '发放积分',
            type: 'bar',
            data: response.dailyPointsIssued?.map((item: any) => item.issued) || []
          },
          {
            name: '消费积分',
            type: 'bar',
            data: response.dailyPointsIssued?.map((item: any) => item.consumed) || []
          }
        ]
      }
    } else {
      pointsChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '积分类型分布',
            type: 'pie',
            radius: '50%',
            data: response.pointsTypeDistribution?.map((item: any) => ({
              name: item.type,
              value: item.total
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  } catch (error) {
    console.error('加载积分统计失败:', error)
  }
}

const loadCouponStatistics = async () => {
  try {
    const { startDate, endDate } = getDateRange()
    const response = await request.get('/statistics/coupons', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dimension: couponDimension.value
      }
    }) as any
    couponStatistics.value = response

    if (couponDimension.value === 'status') {
      couponChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '优惠券状态',
            type: 'pie',
            radius: ['40%', '70%'],
            data: response.couponStatusDistribution?.map((item: any) => ({
              name: item.status,
              value: item.count
            })) || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    } else {
      couponChartOption.value = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '优惠券类型分布',
            type: 'pie',
            radius: '50%',
            data: [
              { name: '满减券', value: response.totalCoupons || 0 },
              { name: '折扣券', value: 0 },
              { name: '兑换券', value: 0 }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  } catch (error) {
    console.error('加载优惠券统计失败:', error)
  }
}

const handleTimeRangeChange = () => {
  loadAllData()
}

const handleCustomDateChange = () => {
  loadAllData()
}

const handleSalesDimensionChange = () => {
  loadSalesStatistics()
}

const handleCustomerDimensionChange = () => {
  loadCustomerStatistics()
}

const handleLotteryDimensionChange = () => {
  loadLotteryStatistics()
}

const handleActivityDimensionChange = () => {
  loadActivityStatistics()
}

const handlePrizeDimensionChange = () => {
  loadPrizeStatistics()
}

const handlePointsDimensionChange = () => {
  loadPointsStatistics()
}

const handleCouponDimensionChange = () => {
  loadCouponStatistics()
}

const loadAllData = async () => {
  await Promise.all([
    loadOverview(),
    loadSalesStatistics(),
    loadCustomerStatistics(),
    loadLotteryStatistics(),
    loadActivityStatistics(),
    loadPrizeStatistics(),
    loadPointsStatistics(),
    loadCouponStatistics()
  ])
}

onMounted(() => {
  loadAllData()
})
</script>

<style lang="scss" scoped>
.statistics {
  padding: 20px;

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;

    .filter-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .filter-label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;

        &.customer-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        &.order-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        &.sales-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        &.lottery-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }

  .chart {
    height: 350px;
    width: 100%;
  }
}
</style>