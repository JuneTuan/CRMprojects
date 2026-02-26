<template>
  <div class="audit-log">
    <el-card>
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">用户名：</span>
          <el-input
            v-model="filters.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @clear="handleFilter"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">操作类型：</span>
          <el-select
            v-model="filters.action"
            placeholder="请选择操作类型"
            clearable
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option label="登录" value="LOGIN" />
            <el-option label="登出" value="LOGOUT" />
            <el-option label="创建" value="CREATE" />
            <el-option label="更新" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="查询" value="READ" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">模块：</span>
          <el-select
            v-model="filters.module"
            placeholder="请选择模块"
            clearable
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option label="认证" value="AUTH" />
            <el-option label="客户管理" value="CUSTOMER" />
            <el-option label="产品管理" value="PRODUCT" />
            <el-option label="订单管理" value="ORDER" />
            <el-option label="优惠券管理" value="COUPON" />
            <el-option label="活动管理" value="ACTIVITY" />
            <el-option label="抽奖管理" value="LOTTERY" />
            <el-option label="会员等级" value="MEMBER_LEVEL" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">状态：</span>
          <el-select
            v-model="filters.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">时间范围：</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleFilter"
          />
        </div>
        <div class="filter-item">
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>审计日志列表</span>
          <el-button type="primary" size="small" @click="loadStatistics">
            <el-icon><Refresh /></el-icon>
            刷新统计
          </el-button>
        </div>
      </template>

      <el-table
        :data="auditLogs"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="logId" label="日志ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="action" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)">
              {{ getActionLabel(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120">
          <template #default="{ row }">
            {{ getModuleLabel(row.module) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog
      v-model="detailDialogVisible"
      title="审计日志详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志ID">{{ currentLog.logId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentLog.username }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getActionType(currentLog.action)">
            {{ getActionLabel(currentLog.action) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模块">{{ getModuleLabel(currentLog.module) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'">
            {{ currentLog.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求方法" v-if="currentLog.requestMethod">
          {{ currentLog.requestMethod }}
        </el-descriptions-item>
        <el-descriptions-item label="响应状态" v-if="currentLog.responseStatus">
          {{ currentLog.responseStatus }}
        </el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2" v-if="currentLog.requestUrl">
          {{ currentLog.requestUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="User Agent" :span="2" v-if="currentLog.userAgent">
          <div style="max-height: 100px; overflow-y: auto; font-size: 12px;">
            {{ currentLog.userAgent }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="请求体" :span="2" v-if="currentLog.requestBody">
          <pre style="max-height: 200px; overflow-y: auto; font-size: 12px;">{{ currentLog.requestBody }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="currentLog.errorMessage">
          <pre style="max-height: 200px; overflow-y: auto; font-size: 12px; color: #f56c6c;">{{ currentLog.errorMessage }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">
          {{ formatDateTime(currentLog.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import axios from 'axios'

interface AuditLog {
  logId: number
  userId?: number
  username?: string
  action: string
  module?: string
  description?: string
  ipAddress?: string
  userAgent?: string
  requestMethod?: string
  requestUrl?: string
  requestBody?: string
  responseStatus?: number
  responseTime?: number
  status: string
  errorMessage?: string
  createdAt: string
}

const auditLogs = ref<AuditLog[]>([])
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref<AuditLog>({} as AuditLog)
const statistics = ref({})
const dateRange = ref([])
const filters = ref({
  username: '',
  action: '',
  module: '',
  status: '',
})

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
})

const getActionType = (action: string) => {
  const typeMap: Record<string, any> = {
    LOGIN: 'success',
    LOGOUT: 'info',
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
    READ: 'info',
  }
  return typeMap[action] || 'info'
}

const getActionLabel = (action: string) => {
  const labelMap: Record<string, string> = {
    LOGIN: '登录',
    LOGOUT: '登出',
    CREATE: '创建',
    UPDATE: '更新',
    DELETE: '删除',
    READ: '查询',
  }
  return labelMap[action] || action
}

const getModuleLabel = (module: string) => {
  const labelMap: Record<string, string> = {
    AUTH: '认证',
    CUSTOMER: '客户管理',
    PRODUCT: '产品管理',
    ORDER: '订单管理',
    COUPON: '优惠券管理',
    ACTIVITY: '活动管理',
    LOTTERY: '抽奖管理',
    MEMBER_LEVEL: '会员等级',
  }
  return labelMap[module] || module
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const loadAuditLogs = async () => {
  try {
    loading.value = true
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (filters.value.username) {
      params.username = filters.value.username
    }
    if (filters.value.action) {
      params.action = filters.value.action
    }
    if (filters.value.module) {
      params.module = filters.value.module
    }
    if (filters.value.status) {
      params.status = filters.value.status
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await axios.get('/audit-logs', { params })
    auditLogs.value = response.data.data
    pagination.value.total = response.data.total
  } catch (error) {
    ElMessage.error('加载审计日志失败')
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await axios.get('/audit-logs/statistics')
    statistics.value = response.data
    ElMessage.success('统计数据已更新')
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const handleFilter = () => {
  pagination.value.page = 1
  loadAuditLogs()
}

const handleReset = () => {
  filters.value = {
    username: '',
    action: '',
    module: '',
    status: '',
  }
  dateRange.value = []
  pagination.value.page = 1
  loadAuditLogs()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadAuditLogs()
}

const handleSizeChange = (size: number) => {
  pagination.value.limit = size
  pagination.value.page = 1
  loadAuditLogs()
}

const handleViewDetail = (row: any) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  loadAuditLogs()
})
</script>

<style scoped>
.audit-log {
  padding: 20px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

pre {
  margin: 0;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
