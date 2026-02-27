<template>
  <div class="dictionary">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典管理</span>
          <el-button type="primary" @click="handleAdd">新增字典</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-select v-model="searchForm.dictType" placeholder="字典类型" clearable style="width: 150px">
          <el-option v-for="type in dictTypes" :key="type" :label="type" :value="type" />
        </el-select>
        <el-input
          v-model="searchForm.dictValue"
          placeholder="字典值"
          clearable
          style="width: 150px; margin-left: 10px"
        />
        <el-input
          v-model="searchForm.dictLabel"
          placeholder="字典标签"
          clearable
          style="width: 150px; margin-left: 10px"
        />
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 100px; margin-left: 10px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch" style="margin-left: 10px">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="dictType" label="字典类型" />
        <el-table-column prop="dictValue" label="字典值" />
        <el-table-column prop="dictLabel" label="字典标签" />
        <el-table-column prop="dictSort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 字典表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="字典类型" prop="dictType">
          <el-select v-model="form.dictType" placeholder="请选择字典类型" filterable allow-create style="width: 100%">
            <el-option v-for="type in dictTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <el-form-item label="字典值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { dictionaryApi, Dictionary } from '@/api/dictionary';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增字典');
const formRef = ref<FormInstance>();
const tableData = ref<Dictionary[]>([]);
const dictTypes = ref<string[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive({
  dictType: '',
  dictValue: '',
  dictLabel: '',
  status: undefined as number | undefined,
});

const form = reactive({
  id: undefined as number | undefined,
  dictType: '',
  dictValue: '',
  dictLabel: '',
  dictSort: 0,
  status: 1,
  remark: '',
});

const rules = reactive<FormRules>({
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
});

// 获取字典列表
const getDictionaryList = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    if (searchForm.dictType) params.dictType = searchForm.dictType;
    if (searchForm.dictValue) params.dictValue = searchForm.dictValue;
    if (searchForm.dictLabel) params.dictLabel = searchForm.dictLabel;
    if (searchForm.status !== undefined) params.status = searchForm.status;

    const response: any = await dictionaryApi.getAll(params);
    tableData.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error('获取字典列表失败:', error);
    ElMessage.error('获取字典列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取字典类型列表
const getDictTypes = async () => {
  try {
    const response: any = await dictionaryApi.getTypes();
    dictTypes.value = response || [];
  } catch (error) {
    console.error('获取字典类型失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getDictionaryList();
};

// 重置
const handleReset = () => {
  searchForm.dictType = '';
  searchForm.dictValue = '';
  searchForm.dictLabel = '';
  searchForm.status = undefined;
  currentPage.value = 1;
  getDictionaryList();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getDictionaryList();
};

// 当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getDictionaryList();
};

// 新增字典
const handleAdd = () => {
  dialogTitle.value = '新增字典';
  Object.assign(form, {
    id: undefined,
    dictType: '',
    dictValue: '',
    dictLabel: '',
    dictSort: 0,
    status: 1,
    remark: '',
  });
  dialogVisible.value = true;
};

// 编辑字典
const handleEdit = (row: Dictionary) => {
  dialogTitle.value = '编辑字典';
  Object.assign(form, {
    id: row.id,
    dictType: row.dictType,
    dictValue: row.dictValue,
    dictLabel: row.dictLabel,
    dictSort: row.dictSort,
    status: row.status,
    remark: row.remark || '',
  });
  dialogVisible.value = true;
};

// 删除字典
const handleDelete = (row: Dictionary) => {
  ElMessageBox.confirm('确定要删除这条字典吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await dictionaryApi.delete(row.id);
        ElMessage.success('删除成功');
        getDictionaryList();
        getDictTypes();
      } catch (error) {
        console.error('删除字典失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (form.id) {
          await dictionaryApi.update(form.id, form);
          ElMessage.success('更新成功');
        } else {
          await dictionaryApi.create(form);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        getDictionaryList();
        getDictTypes();
      } catch (error) {
        console.error('保存字典失败:', error);
        ElMessage.error('保存失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 初始化
onMounted(() => {
  getDictionaryList();
  getDictTypes();
});
</script>

<style scoped>
.dictionary {
  padding: 20px;
}

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
</style>
