<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getInventoryItems, updateInventoryItem, deleteInventoryItem } from '@/api/inventory';
import type { InventoryItem, InventoryQueryParams } from '@/types/interfaces.ts';
import { useUserStore } from '@/stores/user';

// 用户权限检查
const userStore = useUserStore();
const isAdmin = userStore.isAdmin();

// 搜索参数
const category = ref<number | null>(null); // 产品分类
const surface = ref<number | null>(null); // 表面处理
const searchResults = ref<InventoryItem[]>([]); // 存储搜索结果
const total = ref(0); // 总记录数
const page = ref(1); // 当前页码
const size = ref(10); // 每页记录数
const loading = ref(false); // 加载状态

// 编辑对话框控制
const editDialogVisible = ref(false);
const editForm = ref<InventoryItem>({
  id: 0,
  model_number: '',
  manufacturer: '',
  specification: '',
  surface: 0,
  category: 0,
  warehouse_num: 0,
  total_pieces: 0,
  price_per_piece: 0,
  pieces_per_box: 0,
  remark: '',
  create_time: '',
  update_time: '',
});

// 分类和表面处理选项（与数据库枚举一致）
const categoryOptions = [
  { label: '墙砖', value: 1 },
  { label: '地砖', value: 2 },
  { label: '胶', value: 3 },
  { label: '洁具', value: 4 }
];
const surfaceOptions = [
  { label: '抛光', value: 1 },
  { label: '哑光', value: 2 },
  { label: '釉面', value: 3 },
  { label: '通体大理石', value: 4 },
  { label: '微晶石', value: 5 },
  { label: '岩板', value: 6 },
];

// 表单校验规则
const formRules = reactive({
  model_number: [
    { required: true, message: '请输入产品型号', trigger: 'blur' },
    { max: 50, message: '产品型号不能超过50个字符', trigger: 'blur' }
  ],
  manufacturer: [
    { required: true, message: '请输入制造厂商', trigger: 'blur' },
    { max: 50, message: '制造厂商不能超过50个字符', trigger: 'blur' }
  ],
  specification: [
    { required: true, message: '请输入规格', trigger: 'blur' },
    { pattern: /^[0-9]+x[0-9]+cm$/, message: '规格格式必须为数字x数字cm，如600x600mm', trigger: 'blur' }
  ],
  surface: [{ required: true, message: '请选择表面处理', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  warehouse_num: [
    { required: true, message: '请输入仓库编码', trigger: 'blur' },
    { type: 'number', message: '仓库编码必须为数字', trigger: 'blur' }
  ],
  total_pieces: [
    { required: true, message: '请输入总片数', trigger: 'blur' },
    { type: 'number', min: 0, message: '总片数不能小于0', trigger: 'blur' }
  ],
  pieces_per_box: [
    { required: true, message: '请输入每箱片数', trigger: 'blur' },
    { type: 'number', min: 1, message: '每箱片数至少为1', trigger: 'blur' }
  ],
  price_per_piece: [
    { required: true, message: '请输入单片价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '单片价格不能小于0', trigger: 'blur' }
  ]
});

// 计算属性：根据分类显示不同的单位
const getUnitLabel = (category: number) => {
  return [1, 2].includes(category) ? '片' : '个';
};

// 计算总箱数
const calculateTotalBoxes = (row: InventoryItem) => {
  if (!row.total_pieces || !row.pieces_per_box || row.pieces_per_box <= 0) {
    return '-';
  }

  const boxes = Math.floor(row.total_pieces / row.pieces_per_box);
  const remainingPieces = row.total_pieces % row.pieces_per_box;

  if (boxes > 0 && remainingPieces > 0) {
    return `${boxes}箱${remainingPieces}${getUnitLabel(row.category)}`;
  } else if (boxes > 0) {
    return `${boxes}箱`;
  } else {
    return `${remainingPieces}${getUnitLabel(row.category)}`;
  }
};

// 计算属性：总数量的标签文本
const totalLabel = computed(() => {
  return [1, 2].includes(editForm.value.category) ? '总片数' : '总个数';
});

// 计算属性：每箱数量的标签文本
const boxLabel = computed(() => {
  return [1, 2].includes(editForm.value.category) ? '每箱片数' : '每箱个数';
});

// 计算属性：单价的标签文本
const priceLabel = computed(() => {
  return [1, 2].includes(editForm.value.category) ? '单片价格' : '单个价格';
});

// 计算属性：表格列标题
const columnLabels = computed(() => ({
  total: `总${getUnitLabel(category.value || 0)}数`,
  box: `每箱${getUnitLabel(category.value || 0)}数`,
  price: `单${getUnitLabel(category.value || 0)}价格`
}));

// 添加排序方法
const sortInventoryItems = (list: InventoryItem[]) => {
  return [...list].sort((a, b) => {
    const idA = a.id || 0;
    const idB = b.id || 0;
    return idB - idA; // 降序排序
  });
};

// 搜索函数（匹配接口 /api/inventory/items）
const performSearch = async () => {
  loading.value = true;
  try {
    const params: InventoryQueryParams = {
      page: page.value,
      size: size.value
    };
    if (category.value !== null) params.category = category.value;
    if (surface.value !== null) params.surface = surface.value;

    const response = await getInventoryItems(params);
    const data = response.data;
    if (data.code === 200 && data.data?.items) {
      // 对数据进行排序
      searchResults.value = sortInventoryItems(data.data.items);
      total.value = data.data.total || 0;
    } else {
      searchResults.value = [];
      total.value = 0;
      ElMessage.warning('未找到匹配的数据');
    }
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
    total.value = 0;
    ElMessage.error('获取数据失败，请检查网络连接或联系管理员');
  } finally {
    loading.value = false;
  }
};

// 编辑记录（匹配接口 /api/inventory/items/{id}）
const handleEdit = (row: InventoryItem) => {
  editForm.value = { ...row };
  editDialogVisible.value = true;
};

const formRef = ref(null);

const saveEdit = async () => {
  if (!formRef.value) return;

  try {
    await (formRef.value as any).validate();

    const updateData: InventoryItem = {
      id: editForm.value.id,
      model_number: editForm.value.model_number,
      manufacturer: editForm.value.manufacturer,
      specification: editForm.value.specification,
      surface: editForm.value.surface,
      category: editForm.value.category,
      warehouse_num: editForm.value.warehouse_num,
      total_pieces: editForm.value.total_pieces,
      price_per_piece: editForm.value.price_per_piece,
      pieces_per_box: editForm.value.pieces_per_box,
      remark: editForm.value.remark || '',
    };

    const response = await updateInventoryItem(editForm.value.id!, updateData);
    if (response.data.code === 200) {
      ElMessage.success('编辑成功');
      editDialogVisible.value = false;
      await performSearch();
    } else {
      ElMessage.error(response.data.message || '编辑失败');
    }
  } catch (error) {
    console.error('更新库存记录失败:', error);
    ElMessage.error('表单验证失败或编辑失败，请检查输入并重试');
  }
};

// 删除记录（匹配接口 /api/inventory/items/{id}）
const handleDelete = async (row: InventoryItem) => {
  if (!isAdmin) {
    ElMessage.warning('只有管理员才能删除库存记录');
    return;
  }

  try {
    await ElMessageBox.confirm('确定删除此库存记录吗？这个操作不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteInventoryItem(row.id!);
    if (response.data.code === 200) {
      ElMessage.success('删除成功');
      await performSearch();
    } else {
      ElMessage.error(response.data.message || '删除失败');
    }
  } catch (error) {
    if ((error as any).message !== 'cancel') {
      console.error('删除库存记录失败:', error);
      ElMessage.error('删除失败，请稍后重试或联系管理员');
    }
  }
};

// 分页处理器
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  performSearch();
};

const handleSizeChange = (newSize: number) => {
  size.value = newSize;
  page.value = 1; // 重置到第一页
  performSearch();
};

// 重置搜索条件
const resetSearch = () => {
  category.value = null;
  surface.value = null;
  page.value = 1;
};

// 初始加载数据
performSearch();
</script>

<template>
  <div class="inventory-query-container">
    <h1>库存查询</h1>
    <el-divider />

    <div class="header-container">
      <div class="options-section">
        <div class="options-column">
          <div class="option-group">
            <div class="label">产品分类：</div>
            <el-radio-group v-model="category">
              <el-radio :label="null" class="radio-item">全部</el-radio>
              <el-radio
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.value"
                  class="radio-item"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </div>
          <div class="option-group">
            <div class="label">表面处理：</div>
            <el-radio-group v-model="surface">
              <el-radio :label="null" class="radio-item">全部</el-radio>
              <el-radio
                  v-for="item in surfaceOptions"
                  :key="item.value"
                  :label="item.value"
                  class="radio-item"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
      <div class="button-section">
        <el-button type="default" @click="resetSearch">重置</el-button>
        <el-button type="primary" :loading="loading" @click="performSearch">
          搜索
        </el-button>
      </div>
    </div>
    <el-divider />

    <!-- 搜索结果 -->
    <div class="results">
      <el-table
          v-loading="loading"
          :data="searchResults"
          style="width: 100%"
          border
          max-height="600"
      >
        <el-table-column prop="id" label="ID" width="80" fixed />
        <el-table-column prop="model_number" label="产品型号" width="120" fixed />
        <el-table-column prop="manufacturer" label="制造厂商" width="120" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="surface" label="表面处理" width="120">
          <template #default="{ row }">
            {{ surfaceOptions.find(opt => opt.value === row.surface)?.label || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            {{ categoryOptions.find(opt => opt.value === row.category)?.label || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouse_num" label="仓库编码" width="100" />
        <el-table-column prop="total_pieces" width="100">
          <template #header>
            总{{ [1, 2].includes(category || 0) ? '片' : '个' }}数
          </template>
          <template #default="{ row }">
            {{ row.total_pieces.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column width="150">
          <template #header>
            总箱数
          </template>
          <template #default="{ row }">
            {{ calculateTotalBoxes(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="pieces_per_box" width="100">
          <template #header>
            每箱{{ [1, 2].includes(category || 0) ? '片' : '个' }}数
          </template>
          <template #default="{ row }">
            {{ row.pieces_per_box }}
          </template>
        </el-table-column>
        <el-table-column prop="price_per_piece" width="120">
          <template #header>
            单{{ [1, 2].includes(category || 0) ? '片' : '个' }}价格
          </template>
          <template #default="{ row }">
            ¥{{ row.price_per_piece.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="create_time" label="创建时间" width="160" />
        <el-table-column prop="update_time" label="更新时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" v-if="isAdmin" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && searchResults.length === 0" class="no-data">
        暂无匹配数据
      </div>

      <!-- 编辑对话框 -->
      <el-dialog v-model="editDialogVisible" title="编辑库存记录" width="500px" destroy-on-close>
        <el-form ref="formRef" :model="editForm" :rules="formRules" label-width="100px" label-position="right">
          <el-form-item label="产品型号" prop="model_number">
            <el-input v-model="editForm.model_number" />
          </el-form-item>
          <el-form-item label="制造厂商" prop="manufacturer">
            <el-input v-model="editForm.manufacturer" />
          </el-form-item>
          <el-form-item label="规格" prop="specification">
            <el-input v-model="editForm.specification" placeholder="例如：600x600cm" />
          </el-form-item>
          <el-form-item label="表面处理" prop="surface">
            <el-select v-model="editForm.surface" placeholder="请选择表面处理">
              <el-option
                  v-for="item in surfaceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="editForm.category" placeholder="请选择分类">
              <el-option
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="仓库编码" prop="warehouse_num">
            <el-input v-model.number="editForm.warehouse_num" type="number" disabled />
            <div class="form-tip">仓库编码不可修改</div>
          </el-form-item>
          <el-form-item :label="totalLabel" prop="total_pieces">
            <el-input v-model.number="editForm.total_pieces" type="number" min="0" />
          </el-form-item>
          <el-form-item :label="boxLabel" prop="pieces_per_box">
            <el-input v-model.number="editForm.pieces_per_box" type="number" min="1" />
          </el-form-item>
          <el-form-item :label="priceLabel" prop="price_per_piece">
            <el-input v-model.number="editForm.price_per_piece" type="number" min="0" step="0.01">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="editForm.remark" type="textarea" rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </template>
      </el-dialog>
    </div>

    <!-- 底部的分页 -->
    <div class="pagination-container">
      <el-pagination
          v-if="total > 0"
          :current-page="page"
          :page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.inventory-query-container {
  padding: 0 20px;
}

h1 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.header-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.options-section {
  flex: 8;
  display: flex;
  align-items: flex-start;
}

.button-section {
  flex: 2;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 10px;
}

.options-column {
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 16px;
}

.option-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.label {
  white-space: nowrap;
  padding-top: 4px;
  color: #606266;
  min-width: 80px;
  font-weight: 500;
}

.radio-item {
  margin-right: 16px;
}

.results {
  margin-top: 20px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-bottom: 30px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>