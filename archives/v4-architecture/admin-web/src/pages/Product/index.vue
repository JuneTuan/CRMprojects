<template>
  <div class="product">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品管理</span>
          <el-button type="primary" @click="handleAdd">新增产品</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="category" label="分类" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 产品表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :step="0.01" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" placeholder="请输入库存" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增产品');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);

const form = reactive({
  id: null as number | null,
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: '',
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
});

// 获取产品列表
const getProducts = async () => {
  loading.value = true;
  try {
    const response = await request.get('/products');
    tableData.value = response || [];
  } catch (error) {
    console.error('获取产品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 新增产品
const handleAdd = () => {
  dialogTitle.value = '新增产品';
  Object.assign(form, {
    id: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
  });
  dialogVisible.value = true;
};

// 编辑产品
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑产品';
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 删除产品
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该产品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/products/${row.id}`);
      ElMessage.success('删除成功');
      getProducts();
    } catch (error) {
      console.error('删除产品失败:', error);
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
          await request.put(`/products/${form.id}`, form);
          ElMessage.success('更新成功');
        } else {
          await request.post('/products', form);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getProducts();
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
  getProducts();
});
</script>

<style lang="scss" scoped>
.product {
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
