<template>
  <div class="category">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品分类管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增分类</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="productCategoryId" label="ID" width="80" />
        <el-table-column prop="productCategoryName" label="分类名称" />
        <el-table-column prop="parentId" label="父分类ID" width="120">
          <template #default="scope">
            {{ scope.row.parentId || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'info'">
              {{ scope.row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类名称" prop="productCategoryName">
          <el-input v-model="form.productCategoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择父分类" clearable>
            <el-option
              v-for="cat in parentCategories"
              :key="cat.productCategoryId"
              :label="cat.productCategoryName"
              :value="cat.productCategoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/api';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增分类');
const formRef = ref<FormInstance>();
const tableData = ref<any[]>([]);

const form = reactive({
  productCategoryId: null as number | null,
  productCategoryName: '',
  parentId: null as number | null,
  sortOrder: 0,
  isActive: true,
});

const rules = reactive<FormRules>({
  productCategoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
});

const parentCategories = computed(() => {
  return tableData.value.filter(cat => !cat.parentId);
});

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN');
};

const getCategories = async () => {
  loading.value = true;
  try {
    const response: any = await request.get('/products/categories');
    tableData.value = response || [];
    console.log('分类列表:', tableData.value);
  } catch (error) {
    console.error('获取分类列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  dialogTitle.value = '新增分类';
  Object.assign(form, {
    productCategoryId: null,
    productCategoryName: '',
    parentId: null,
    sortOrder: 0,
    isActive: true,
  });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑分类';
  Object.assign(form, {
    productCategoryId: row.productCategoryId,
    productCategoryName: row.productCategoryName,
    parentId: row.parentId,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  });
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该分类吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/products/categories/${row.productCategoryId}`);
      ElMessage.success('删除成功');
      getCategories();
    } catch (error) {
      console.error('删除分类失败:', error);
    }
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (form.productCategoryId) {
          const { productCategoryId, ...data } = form;
          await request.put(`/products/categories/${form.productCategoryId}`, data);
          ElMessage.success('更新成功');
        } else {
          const { productCategoryId, ...data } = form;
          await request.post('/products/categories', data);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        getCategories();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  getCategories();
});
</script>

<style lang="scss" scoped>
.category {
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
