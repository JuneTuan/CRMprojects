<template>
  <div class="order">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" @click="handleAdd">新增订单</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="customerName" label="客户" />
        <el-table-column prop="productName" label="产品" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="totalAmount" label="总额" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 订单表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户">
            <el-option
              v-for="customer in customers"
              :key="customer.id"
              :label="customer.name"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="productId">
          <el-select v-model="form.productId" placeholder="请选择产品" @change="handleProductChange">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" placeholder="请输入数量" @change="handleQuantityChange" />
        </el-form-item>
        <el-form-item label="总额" prop="totalAmount">
          <el-input v-model="form.totalAmount" disabled placeholder="自动计算" />
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
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增订单');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);
const customers = ref<any[]>([]);
const products = ref<any[]>([]);

const form = reactive({
  id: null as number | null,
  customerId: '',
  productId: '',
  quantity: 1,
  totalAmount: 0,
});

const rules = reactive<FormRules>({
  customerId: [{ required: true, message: '请选择客户', trigger: 'blur' }],
  productId: [{ required: true, message: '请选择产品', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
});

// 获取订单列表
const getOrders = async () => {
  loading.value = true;
  try {
    const response = await request.get('/orders');
    tableData.value = (response || []).map((order: any) => {
      const customer = customers.value.find((c: any) => c.id === order.customerId);
      const product = products.value.find((p: any) => p.id === order.productId);
      return {
        ...order,
        customerName: customer?.name || '未知',
        productName: product?.name || '未知',
        totalAmount: order.totalPrice || order.totalAmount || 0,
      };
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取客户列表
const getCustomers = async () => {
  try {
    const response = await request.get('/customers');
    customers.value = response || [];
    if (tableData.value.length > 0) {
      getOrders();
    }
  } catch (error) {
    console.error('获取客户列表失败:', error);
  }
};

// 获取产品列表
const getProducts = async () => {
  try {
    const response = await request.get('/products');
    products.value = response || [];
    if (tableData.value.length > 0) {
      getOrders();
    }
  } catch (error) {
    console.error('获取产品列表失败:', error);
  }
};

// 产品变化处理
const handleProductChange = () => {
  const product = products.value.find(p => p.id === form.productId);
  if (product) {
    form.totalAmount = product.price * form.quantity;
  }
};

// 数量变化处理
const handleQuantityChange = () => {
  const product = products.value.find(p => p.id === form.productId);
  if (product) {
    form.totalAmount = product.price * form.quantity;
  }
};

// 新增订单
const handleAdd = () => {
  dialogTitle.value = '新增订单';
  Object.assign(form, {
    id: null,
    customerId: '',
    productId: '',
    quantity: 1,
    totalAmount: 0,
  });
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 转换字段名以匹配后端API
        const orderData = {
          customerId: form.customerId,
          productId: form.productId,
          quantity: form.quantity,
          totalPrice: form.totalAmount, // 后端期望 totalPrice
        };
        await request.post('/orders', orderData);
        ElMessage.success('新增成功');
        dialogVisible.value = false;
        getOrders();
      } catch (error) {
        console.error('提交表单失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return map[status] || '';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] || '';
};

// 初始化
onMounted(() => {
  getOrders();
  getCustomers();
  getProducts();
});
</script>

<style lang="scss" scoped>
.order {
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
