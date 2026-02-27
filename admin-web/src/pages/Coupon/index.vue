<template>
  <div class="coupon">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>优惠券管理</span>
          <div>
            <el-button type="success" @click="handleAnalysis">数据分析</el-button>
            <el-button type="primary" @click="handleAdd">新增优惠券</el-button>
          </div>
        </div>
      </template>
      
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="优惠券码或名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已结束" value="已结束" />
            </el-select>
          </el-form-item>
          <el-form-item label="最低等级">
            <el-select v-model="searchForm.minLevel" placeholder="全部" clearable style="width: 120px">
              <el-option label="普通会员" value="普通会员" />
              <el-option label="白银会员" value="白银会员" />
              <el-option label="黄金会员" value="黄金会员" />
              <el-option label="钻石会员" value="钻石会员" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="couponCode" label="优惠券码" width="120" />
        <el-table-column prop="couponName" label="优惠券名称" />
        <el-table-column prop="value" label="抵扣金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.value }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalQuantity" label="总数量" width="80" />
        <el-table-column prop="remainingQuantity" label="剩余" width="80" />
        <el-table-column label="操作" width="400" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="handleStatistics(scope.row)">统计</el-button>
            <el-button size="small" type="success" @click="handleClaim(scope.row)">领取</el-button>
            <el-button size="small" type="warning" @click="handleClaimRecords(scope.row)">领取记录</el-button>
            <el-button size="small" type="danger" @click="handleVerify(scope.row)">核销</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="优惠券码" prop="couponCode">
          <el-input v-model="form.couponCode" placeholder="请输入优惠券码" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="优惠券名称" prop="couponName">
          <el-input v-model="form.couponName" placeholder="请输入优惠券名称" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="抵扣金额" prop="value">
          <el-input-number 
            v-model="form.value" 
            :min="0" 
            :max="9999" 
            :precision="0" 
            style="width: 100%;" 
          />
          <span style="margin-left: 10px; color: #999;">元</span>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="总数量" prop="totalQuantity">
          <el-input-number v-model="form.totalQuantity" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="剩余数量" prop="remainingQuantity">
          <el-input-number v-model="form.remainingQuantity" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="每人限领" prop="maxUsesPerUser">
          <el-input-number v-model="form.maxUsesPerUser" :min="1" style="width: 100%;" />
          <span style="margin-left: 10px; color: #999;">张</span>
        </el-form-item>
        <el-form-item label="最低等级" prop="minLevel">
          <el-select v-model="form.minLevel" placeholder="请选择最低等级" clearable style="width: 100%;">
            <el-option label="普通会员" value="普通会员" />
            <el-option label="白银会员" value="白银会员" />
            <el-option label="黄金会员" value="黄金会员" />
            <el-option label="钻石会员" value="钻石会员" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用产品" prop="applicableProducts">
          <el-input 
            v-model="form.applicableProducts" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入适用产品ID，多个ID用逗号分隔（留空表示全部产品）"
            style="width: 100%;" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="statisticsDialogVisible"
      title="优惠券统计"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="statistics">
        <el-descriptions-item label="优惠券名称">{{ statistics.couponName }}</el-descriptions-item>
        <el-descriptions-item label="总数量">{{ statistics.totalQuantity }}</el-descriptions-item>
        <el-descriptions-item label="剩余数量">{{ statistics.remainingQuantity }}</el-descriptions-item>
        <el-descriptions-item label="已领取">{{ statistics.claimedCount }}</el-descriptions-item>
        <el-descriptions-item label="已使用">{{ statistics.usedCount }}</el-descriptions-item>
        <el-descriptions-item label="未使用">{{ statistics.unusedCount }}</el-descriptions-item>
        <el-descriptions-item label="领取率">{{ statistics.claimRate }}%</el-descriptions-item>
        <el-descriptions-item label="使用率">{{ statistics.useRate }}%</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statisticsDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="claimDialogVisible"
      title="优惠券领取"
      width="500px"
    >
      <el-form :model="claimForm" :rules="claimRules" ref="claimFormRef" label-width="100px">
        <el-form-item label="优惠券码">
          <el-input v-model="claimForm.couponCode" disabled />
        </el-form-item>
        <el-form-item label="优惠券名称">
          <el-input v-model="claimForm.couponName" disabled />
        </el-form-item>
        <el-form-item label="选择客户" prop="customerId">
          <el-select v-model="claimForm.customerId" placeholder="请选择客户" style="width: 100%;">
            <el-option
              v-for="customer in customers"
              :key="customer.customerId"
              :label="customer.customerName"
              :value="customer.customerId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="claimDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleClaimSubmit" :loading="claimLoading">确定领取</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="verifyDialogVisible"
      title="优惠券核销"
      width="600px"
    >
      <el-form :model="verifyForm" :rules="verifyRules" ref="verifyFormRef" label-width="100px">
        <el-form-item label="优惠券码" prop="code">
          <el-input 
            v-model="verifyForm.code" 
            placeholder="请输入优惠券码" 
            @keyup.enter="handleCheckCoupon"
            style="width: 100%;" 
          />
        </el-form-item>
        <el-button type="primary" @click="handleCheckCoupon" :loading="checkLoading" style="width: 100%; margin-bottom: 20px;">
          检查优惠券
        </el-button>
        
        <div v-if="couponInfo" class="coupon-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="优惠券名称">{{ couponInfo.couponName }}</el-descriptions-item>
            <el-descriptions-item label="抵扣金额">¥{{ couponInfo.value }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDate(couponInfo.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDate(couponInfo.endTime) }}</el-descriptions-item>
            <el-descriptions-item label="总数量">{{ couponInfo.totalQuantity }}</el-descriptions-item>
            <el-descriptions-item label="剩余数量">{{ couponInfo.remainingQuantity }}</el-descriptions-item>
          </el-descriptions>
          
          <div v-if="couponInfo.customers && couponInfo.customers.length > 0" style="margin-top: 20px;">
            <div style="margin-bottom: 10px; font-weight: bold;">已领取该优惠券的客户：</div>
            <el-radio-group v-model="verifyForm.customerId" style="width: 100%;">
              <el-radio 
                v-for="customer in couponInfo.customers" 
                :key="customer.customerId" 
                :value="customer.customerId"
                style="display: block; margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 4px;"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: bold;">{{ customer.customerName }}</div>
                    <div style="color: #999; font-size: 12px;">{{ customer.customerPhone }}</div>
                  </div>
                  <div style="color: #999; font-size: 12px;">{{ formatDate(customer.receivedAt) }} 领取</div>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
          <div v-else style="margin-top: 20px; text-align: center; color: #999;">
            暂无客户领取该优惠券
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="verifyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleVerifySubmit" :loading="verifyLoading" :disabled="!couponInfo">确定核销</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="claimRecordsDialogVisible"
      title="优惠券领取记录"
      width="900px"
    >
      <el-table :data="claimRecordsData" style="width: 100%" v-loading="claimRecordsLoading">
        <el-table-column prop="customer.customerName" label="客户名称" />
        <el-table-column prop="customer.customerPhone" label="客户电话" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已使用' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receivedAt" label="领取时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.receivedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="usedAt" label="使用时间" width="180">
          <template #default="scope">
            {{ scope.row.usedAt ? formatDate(scope.row.usedAt) : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="claimRecordsCurrentPage"
          v-model:page-size="claimRecordsPageSize"
          :page-sizes="[10, 20, 50]"
          :total="claimRecordsTotal"
          layout="total, sizes, prev, pager, next"
          @size-change="handleClaimRecordsSizeChange"
          @current-change="handleClaimRecordsCurrentChange"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="claimRecordsDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="analysisDialogVisible"
      title="优惠券数据分析"
      width="900px"
    >
      <div v-loading="!analysisData">
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">{{ analysisData?.totalCoupons || 0 }}</div>
              <div class="stat-label">优惠券总数</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">{{ analysisData?.activeCoupons || 0 }}</div>
              <div class="stat-label">进行中</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">{{ analysisData?.totalClaimed || 0 }}</div>
              <div class="stat-label">已领取</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">{{ analysisData?.totalUsed || 0 }}</div>
              <div class="stat-label">已使用</div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">{{ analysisData?.totalQuantity || 0 }}</div>
              <div class="stat-label">总发放数量</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">{{ analysisData?.totalUnused || 0 }}</div>
              <div class="stat-label">未使用</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">{{ analysisData?.claimRate || 0 }}%</div>
              <div class="stat-label">领取率</div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="24">
            <el-card shadow="hover">
              <template #header>
                <span>状态分布</span>
              </template>
              <div v-if="analysisData?.statusStats && analysisData.statusStats.length > 0">
                <div v-for="item in analysisData.statusStats" :key="item.status" class="stat-item">
                  <span>{{ item.status }}</span>
                  <el-progress :percentage="Number(((item.count / analysisData.totalCoupons) * 100).toFixed(2))" />
                  <span>{{ item.count }}</span>
                </div>
              </div>
              <div v-else class="empty-text">暂无数据</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="analysisDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const claimLoading = ref(false);
const verifyLoading = ref(false);
const checkLoading = ref(false);
const dialogVisible = ref(false);
const statisticsDialogVisible = ref(false);
const claimDialogVisible = ref(false);
const verifyDialogVisible = ref(false);
const claimRecordsDialogVisible = ref(false);
const analysisDialogVisible = ref(false);
const dialogTitle = ref('新增优惠券');
const formRef = ref<FormInstance>();
const claimFormRef = ref<FormInstance>();
const verifyFormRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const customers = ref<any[]>([]);
const searchForm = reactive({
  keyword: '',
  status: '',
  minLevel: '',
  dateRange: [] as string[],
});
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const statistics = ref<any>(null);
const claimRecordsData = ref<any[]>([]);
const claimRecordsLoading = ref(false);
const claimRecordsCurrentPage = ref(1);
const claimRecordsPageSize = ref(10);
const claimRecordsTotal = ref(0);
const currentCouponId = ref<number | null>(null);
const analysisData = ref<any>(null);
const verifyForm = reactive({
  code: '',
  customerId: null as number | null,
});
const couponInfo = ref<any>(null);

const form = reactive({
  couponId: null as number | null,
  couponCode: '',
  couponName: '',
  value: 0,
  startTime: '' as string | Date,
  endTime: '' as string | Date,
  totalQuantity: 100,
  remainingQuantity: 100,
  maxUsesPerUser: 1,
  minLevel: null as string | null,
  applicableProducts: '',
  status: '未开始',
});

const claimForm = reactive({
  couponId: null as number | null,
  couponCode: '',
  couponName: '',
  customerId: null as number | null,
});

const rules = reactive<FormRules>({
  couponCode: [{ required: true, message: '请输入优惠券码', trigger: 'blur' }],
  couponName: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入抵扣金额', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  totalQuantity: [{ required: true, message: '请输入总数量', trigger: 'blur' }],
  remainingQuantity: [{ required: true, message: '请输入剩余数量', trigger: 'blur' }],
});

const claimRules = reactive<FormRules>({
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
});

const verifyRules = reactive<FormRules>({
  code: [{ required: true, message: '请输入优惠券码', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
});

const getCoupons = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (searchForm.keyword) {
      params.search = searchForm.keyword;
    }
    if (searchForm.status) {
      params.status = searchForm.status;
    }
    if (searchForm.minLevel) {
      params.minLevel = searchForm.minLevel;
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    const response: any = await request.get('/coupons', { params });
    console.log('优惠券列表响应:', response);
    tableData.value = Array.isArray(response) ? response : (response.data || []);
    total.value = response.total || 0;
  } catch (error) {
    console.error('获取优惠券列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const getCustomers = async () => {
  try {
    const response: any = await request.get('/api/v6/customers');
    customers.value = response.data || [];
  } catch (error) {
    console.error('获取客户列表失败:', error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  getCoupons();
};

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: '',
    minLevel: '',
    dateRange: [],
  });
  currentPage.value = 1;
  getCoupons();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getCoupons();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getCoupons();
};

const handleAdd = () => {
  dialogTitle.value = '新增优惠券';
  Object.assign(form, {
    couponId: null,
    couponCode: `CPN${Date.now().toString().slice(-6)}`,
    couponName: '',
    value: 0,
    startTime: new Date(),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    totalQuantity: 100,
    remainingQuantity: 100,
    maxUsesPerUser: 1,
    minLevel: null,
    applicableProducts: '',
    status: '未开始',
  });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑优惠券';
  Object.assign(form, {
    couponId: row.couponId,
    couponCode: row.couponCode,
    couponName: row.couponName,
    value: row.value,
    startTime: new Date(row.startTime),
    endTime: new Date(row.endTime),
    totalQuantity: row.totalQuantity,
    remainingQuantity: row.remainingQuantity,
    maxUsesPerUser: row.maxUsesPerUser,
    minLevel: row.minLevel,
    applicableProducts: row.applicableProducts || '',
    status: row.status,
  });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const couponData = {
          couponCode: form.couponCode,
          couponName: form.couponName,
          value: form.value,
          startTime: typeof form.startTime === 'string' ? form.startTime : form.startTime.toISOString(),
          endTime: typeof form.endTime === 'string' ? form.endTime : form.endTime.toISOString(),
          totalQuantity: form.totalQuantity,
          remainingQuantity: form.remainingQuantity,
          maxUsesPerUser: form.maxUsesPerUser,
          minLevel: form.minLevel,
          applicableProducts: form.applicableProducts,
          status: form.status,
        };

        if (form.couponId) {
          await request.put(`/coupons/${form.couponId}`, couponData);
          ElMessage.success('编辑成功');
        } else {
          await request.post('/coupons', couponData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getCoupons();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleStatistics = async (row: any) => {
  try {
    const response: any = await request.get(`/coupons/${row.couponId}/statistics`);
    statistics.value = response;
    statisticsDialogVisible.value = true;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

const handleClaim = (row: any) => {
  Object.assign(claimForm, {
    couponId: row.couponId,
    couponCode: row.couponCode,
    couponName: row.couponName,
    customerId: null,
  });
  claimDialogVisible.value = true;
};

const handleClaimSubmit = async () => {
  if (!claimFormRef.value) return;
  await claimFormRef.value.validate(async (valid) => {
    if (valid) {
      claimLoading.value = true;
      try {
        await request.post(`/coupons/customer/${claimForm.customerId}/claim/${claimForm.couponId}`);
        ElMessage.success('领取成功');
        claimDialogVisible.value = false;
        getCoupons();
      } catch (error: any) {
        console.error('领取失败:', error);
        ElMessage.error(error.response?.data?.message || '领取失败');
      } finally {
        claimLoading.value = false;
      }
    }
  });
};

const handleVerify = (row: any) => {
  verifyForm.code = row.couponCode;
  verifyForm.customerId = null;
  couponInfo.value = null;
  verifyDialogVisible.value = true;
};

const handleCheckCoupon = async () => {
  if (!verifyForm.code) {
    ElMessage.warning('请输入优惠券码');
    return;
  }
  checkLoading.value = true;
  try {
    const response: any = await request.post('/coupons/verify-code', { code: verifyForm.code });
    couponInfo.value = response;
    ElMessage.success('优惠券检查成功');
  } catch (error: any) {
    console.error('检查优惠券失败:', error);
    ElMessage.error(error.response?.data?.message || '检查优惠券失败');
    couponInfo.value = null;
  } finally {
    checkLoading.value = false;
  }
};

const handleVerifySubmit = async () => {
  if (!verifyFormRef.value) return;
  await verifyFormRef.value.validate(async (valid) => {
    if (valid) {
      verifyLoading.value = true;
      try {
        await request.post('/coupons/verify', {
          code: verifyForm.code,
          customerId: verifyForm.customerId,
        });
        ElMessage.success('核销成功');
        verifyDialogVisible.value = false;
        getCoupons();
      } catch (error: any) {
        console.error('核销失败:', error);
        ElMessage.error(error.response?.data?.message || '核销失败');
      } finally {
        verifyLoading.value = false;
      }
    }
  });
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该优惠券吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/coupons/${row.couponId}`);
      ElMessage.success('删除成功');
      getCoupons();
    } catch (error) {
      console.error('删除失败:', error);
    }
  });
};

const handleClaimRecords = (row: any) => {
  currentCouponId.value = row.couponId;
  claimRecordsCurrentPage.value = 1;
  claimRecordsDialogVisible.value = true;
  getClaimRecords();
};

const getClaimRecords = async () => {
  if (!currentCouponId.value) return;
  claimRecordsLoading.value = true;
  try {
    const response: any = await request.get(`/coupons/${currentCouponId.value}/claim-records`, {
      params: {
        page: claimRecordsCurrentPage.value,
        limit: claimRecordsPageSize.value,
      },
    });
    claimRecordsData.value = response.data || [];
    claimRecordsTotal.value = response.total || 0;
  } catch (error) {
    console.error('获取领取记录失败:', error);
  } finally {
    claimRecordsLoading.value = false;
  }
};

const handleClaimRecordsSizeChange = (size: number) => {
  claimRecordsPageSize.value = size;
  claimRecordsCurrentPage.value = 1;
  getClaimRecords();
};

const handleClaimRecordsCurrentChange = (page: number) => {
  claimRecordsCurrentPage.value = page;
  getClaimRecords();
};

const handleAnalysis = async () => {
  analysisDialogVisible.value = true;
  analysisData.value = null;
  try {
    const response: any = await request.get('/coupons/analysis/overview');
    analysisData.value = response;
  } catch (error) {
    console.error('获取数据分析失败:', error);
  }
};

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '未开始': 'info',
    '进行中': 'success',
    '已结束': 'danger',
  };
  return map[status] || '';
};

const formatDate = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  getCoupons();
  getCustomers();
});
</script>

<style lang="scss" scoped>
.coupon {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    text-align: center;
    padding: 20px;
    
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 10px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    
    span:first-child {
      flex: 1;
      margin-right: 10px;
    }
    
    .el-progress {
      flex: 2;
      margin-right: 10px;
    }
    
    span:last-child {
      width: 60px;
      text-align: right;
      font-weight: bold;
    }
  }

  .empty-text {
    text-align: center;
    color: #909399;
    padding: 20px 0;
  }

  .coupon-info {
    margin-top: 20px;
  }
}
</style>
