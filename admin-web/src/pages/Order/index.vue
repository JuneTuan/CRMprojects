<template>
  <div class="order">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增订单</el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号、客户名称"
          clearable
          style="width: 300px; margin-right: 10px;"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customer" label="客户" width="120">
          <template #default="scope">
            {{ scope.row.customer?.customerName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="产品信息" min-width="200">
          <template #default="scope">
            <div v-for="item in scope.row.orderItems" :key="item.orderItemId" class="product-item">
              {{ item.productName }} x {{ item.quantity }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="scope">
            ¥{{ Number(scope.row.totalAmount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实付金额" width="120">
          <template #default="scope">
            ¥{{ Number(scope.row.actualAmount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberLevel" label="会员等级" width="100">
          <template #default="scope">
            <div v-if="scope.row.customer?.memberLevel" style="display: flex; align-items: center; gap: 5px;">
              <el-icon v-if="scope.row.customer.memberLevel.iconCode" :size="16" color="#409eff">
                <component :is="scope.row.customer.memberLevel.iconCode" />
              </el-icon>
              <el-tag :type="getLevelTagType(scope.row.customer.memberLevel.levelName)">
                {{ scope.row.customer.memberLevel.levelName }}
              </el-tag>
            </div>
            <el-tag v-else type="info">普通会员</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalConsumption" label="消费额" width="120">
          <template #default="scope">
            ¥{{ Number(scope.row.customer?.totalConsumption || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="isPoints" label="积分" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isPoints" type="success">+{{ scope.row.points }}</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="handleEdit(scope.row)" v-if="scope.row.status === '待支付'">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号">
              <el-input v-model="form.orderNo" disabled placeholder="自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="form.customerId" placeholder="请选择客户" filterable @change="handleCustomerChange">
                <el-option
                  v-for="customer in customers"
                  :key="customer.customerId"
                  :label="customer.customerName"
                  :value="customer.customerId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前消费额">
              <span v-if="currentCustomer">¥{{ Number(currentCustomer.totalConsumption || 0).toFixed(2) }}</span>
              <span v-else>-</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计消费额">
              <span v-if="currentCustomer && form.actualAmount">¥{{ (Number(currentCustomer.totalConsumption || 0) + form.actualAmount).toFixed(2) }}</span>
              <span v-else>-</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" @change="handleStatusChange">
                <el-option label="待支付" value="待支付" />
                <el-option label="已支付" value="已支付" />
                <el-option label="已发货" value="已发货" />
                <el-option label="已完成" value="已完成" />
                <el-option label="已取消" value="已取消" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.status === '已完成' && predictedLevel">
            <el-form-item label="预计等级">
              <el-tag :type="getLevelTagType(predictedLevel.levelName)" effect="dark">
                {{ predictedLevel.levelName }}
              </el-tag>
              <el-icon v-if="currentCustomerLevel && predictedLevel.levelId !== currentCustomerLevel.levelId" style="margin-left: 10px; color: #67c23a;">
                <ArrowUp />
              </el-icon>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="产品明细" prop="orderItems">
          <div class="order-items">
            <div v-for="(item, index) in form.orderItems" :key="index" class="order-item">
              <el-select v-model="item.productId" placeholder="选择产品" style="width: 200px; margin-right: 10px;" @change="handleProductChange(index)">
                <el-option
                  v-for="product in products"
                  :key="product.productId"
                  :label="product.stock > 0 ? product.productName : `${product.productName} (无货)`"
                  :value="product.productId"
                  :disabled="product.stock <= 0"
                />
              </el-select>
              <el-input-number v-model="item.quantity" :min="1" placeholder="数量" style="width: 120px; margin-right: 10px;" @change="calculateTotal" />
              <el-input-number v-model="item.unitPrice" :min="0" :step="0.01" :precision="2" placeholder="单价" style="width: 120px; margin-right: 10px;" @change="calculateTotal" />
              <el-input v-model="item.subtotal" disabled placeholder="小计" style="width: 120px; margin-right: 10px;" />
              <el-button type="danger" :icon="Delete" @click="removeOrderItem(index)" v-if="form.orderItems.length > 1" />
            </div>
            <el-button type="primary" :icon="Plus" @click="addOrderItem" style="margin-top: 10px;">添加产品</el-button>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单金额" prop="totalAmount">
              <el-input-number v-model="form.totalAmount" :min="0" :step="0.01" :precision="2" placeholder="订单金额" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实付金额" prop="actualAmount">
              <el-input-number v-model="form.actualAmount" :min="0" :step="0.01" :precision="2" placeholder="实付金额" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否积分" prop="isPoints">
              <el-switch v-model="form.isPoints" @change="handlePointsChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="积分数量" prop="points">
              <el-input-number v-model="form.points" :min="0" placeholder="积分数量" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="收货地址" prop="shippingAddress">
          <el-input v-model="form.shippingAddress" type="textarea" :rows="2" placeholder="请输入收货地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="订单详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentOrder.customer?.customerName }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ Number(currentOrder.totalAmount).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">¥{{ Number(currentOrder.actualAmount).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="积分">
          <el-tag v-if="currentOrder.isPoints" type="success">+{{ currentOrder.points }}</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.shippingAddress }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>产品明细</el-divider>

      <el-table :data="currentOrder.orderItems" style="width: 100%">
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unitPrice" label="单价" width="120">
          <template #default="scope">
            ¥{{ Number(scope.row.unitPrice).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="subtotal" label="小计" width="120">
          <template #default="scope">
            ¥{{ Number(scope.row.subtotal).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { Search, Plus, Delete, ArrowUp } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const viewDialogVisible = ref(false);
const dialogTitle = ref('新增订单');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const customers = ref<any[]>([]);
const products = ref<any[]>([]);
const memberLevels = ref<any[]>([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const currentOrder = ref<any>({});
const currentCustomer = ref<any>(null);
const currentCustomerLevel = ref<any>(null);
const predictedLevel = ref<any>(null);

const form = reactive({
  orderId: null as number | null,
  orderNo: '',
  customerId: null as number | null,
  status: '待支付',
  totalAmount: 0,
  actualAmount: 0,
  isPoints: true,
  points: 0,
  shippingAddress: '',
  orderItems: [
    {
      productId: null as number | null,
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    },
  ],
});

const rules = reactive<FormRules>({
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  status: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
  totalAmount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }],
  actualAmount: [{ required: true, message: '请输入实付金额', trigger: 'blur' }],
  shippingAddress: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
});

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN');
};

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '待支付': 'warning',
    '已支付': 'success',
    '已发货': 'primary',
    '已完成': 'success',
    '已取消': 'info',
  };
  return map[status] || '';
};

const getOrders = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      sort: 'createdAt',
      order: 'desc',
    };
    if (searchKeyword.value) {
      params.search = searchKeyword.value;
    }
    const response: any = await request.get('/orders', { params });
    tableData.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error('获取订单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const getCustomers = async () => {
  try {
    const response: any = await request.get('/customers');
    customers.value = response.data || [];
    console.log('客户列表:', customers.value);
  } catch (error) {
    console.error('获取客户列表失败:', error);
  }
};

const getProducts = async () => {
  try {
    const response: any = await request.get('/products');
    products.value = response.data || [];
    console.log('产品列表:', products.value);
  } catch (error) {
    console.error('获取产品列表失败:', error);
  }
};

const getMemberLevels = async () => {
  try {
    const response: any = await request.get('/member-level');
    memberLevels.value = response || [];
    console.log('会员等级列表:', memberLevels.value);
  } catch (error) {
    console.error('获取会员等级列表失败:', error);
  }
};

const getLevelTagType = (levelName: string) => {
  const map: Record<string, any> = {
    '普通会员': 'info',
    '白银会员': '',
    '黄金会员': 'warning',
    '钻石会员': 'danger',
  };
  return map[levelName] || '';
};

const handleCustomerChange = async () => {
  if (!form.customerId) {
    currentCustomer.value = null;
    currentCustomerLevel.value = null;
    predictedLevel.value = null;
    return;
  }

  const customer = customers.value.find(c => c.customerId === form.customerId);
  if (customer) {
    currentCustomer.value = customer;
    currentCustomerLevel.value = customer.memberLevel || null;
    calculatePredictedLevel();
  }
};

const calculatePredictedLevel = () => {
  if (!currentCustomer.value || !form.actualAmount) {
    predictedLevel.value = null;
    return;
  }

  const currentConsumption = Number(currentCustomer.value.totalConsumption || 0);
  const predictedConsumption = currentConsumption + form.actualAmount;

  const sortedLevels = [...memberLevels.value].sort((a, b) => a.minConsumption - b.minConsumption);
  
  for (let i = sortedLevels.length - 1; i >= 0; i--) {
    if (predictedConsumption >= sortedLevels[i].minConsumption) {
      predictedLevel.value = sortedLevels[i];
      return;
    }
  }

  predictedLevel.value = sortedLevels[0] || null;
};

const handleStatusChange = () => {
  if (form.status === '已完成') {
    calculatePredictedLevel();
  } else {
    predictedLevel.value = null;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  getOrders();
};

const handleReset = () => {
  searchKeyword.value = '';
  currentPage.value = 1;
  getOrders();
};

const handleAdd = () => {
  dialogTitle.value = '新增订单';
  Object.assign(form, {
    orderId: null,
    orderNo: `ORD_${Date.now()}`,
    customerId: null,
    status: '待支付',
    totalAmount: 0,
    actualAmount: 0,
    isPoints: true,
    points: 0,
    shippingAddress: '',
    orderItems: [
      {
        productId: null,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ],
  });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑订单';
  Object.assign(form, {
    orderId: row.orderId,
    orderNo: row.orderNo,
    customerId: row.customerId,
    status: row.status,
    totalAmount: Number(row.totalAmount),
    actualAmount: Number(row.actualAmount),
    isPoints: row.isPoints,
    points: row.points,
    shippingAddress: row.shippingAddress,
    orderItems: row.orderItems.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  });
  dialogVisible.value = true;
};

const handleView = (row: any) => {
  currentOrder.value = row;
  viewDialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该订单吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/orders/${row.orderId}`);
      ElMessage.success('删除成功');
      getOrders();
    } catch (error) {
      console.error('删除订单失败:', error);
    }
  });
};

const addOrderItem = () => {
  form.orderItems.push({
    productId: null,
    quantity: 1,
    unitPrice: 0,
    subtotal: 0,
  });
};

const removeOrderItem = (index: number) => {
  form.orderItems.splice(index, 1);
  calculateTotal();
};

const handleProductChange = (index: number) => {
  const product = products.value.find(p => p.productId === form.orderItems[index].productId);
  if (product) {
    form.orderItems[index].unitPrice = Number(product.price);
    form.orderItems[index].subtotal = form.orderItems[index].quantity * form.orderItems[index].unitPrice;
    calculateTotal();
  }
};

const calculateTotal = () => {
  form.orderItems.forEach(item => {
    item.subtotal = item.quantity * item.unitPrice;
  });
  form.totalAmount = form.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  form.actualAmount = form.totalAmount;
  if (form.isPoints) {
    form.points = form.totalAmount;
  } else {
    form.points = 0;
  }
  calculatePredictedLevel();
};

const handlePointsChange = () => {
  if (form.isPoints) {
    form.points = form.totalAmount;
  } else {
    form.points = 0;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const invalidItems = form.orderItems.filter(item => !item.productId);
  if (invalidItems.length > 0) {
    ElMessage.error('请为所有产品行选择产品');
    return;
  }
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const orderData = {
          orderNo: form.orderNo || `ORD_${Date.now()}`,
          customerId: form.customerId,
          totalAmount: form.totalAmount,
          status: form.status,
          shippingAddress: form.shippingAddress,
          isPoints: form.isPoints,
          orderItems: form.orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        };

        if (form.orderId) {
          await request.put(`/orders/${form.orderId}`, orderData);
          ElMessage.success('更新成功');
        } else {
          await request.post('/orders', orderData);
          ElMessage.success('创建成功');
        }

        dialogVisible.value = false;
        getOrders();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getOrders();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  getOrders();
};

onMounted(() => {
  getOrders();
  getCustomers();
  getProducts();
  getMemberLevels();
});
</script>

<style lang="scss" scoped>
.order {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-bar {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .product-item {
    margin-bottom: 5px;
  }

  .order-items {
    width: 100%;

    .order-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  .dialog-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
