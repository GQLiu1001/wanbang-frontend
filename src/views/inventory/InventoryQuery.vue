<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mocked fallback data（与库存表字段一致）
const mockResult = {
  id: 0,
  model_number: '默认型号',
  manufacturer: '默认厂商',
  specification: '默认规格',
  surface: 1, // 1=抛光
  category: 2, // 2=地砖
  warehouse_num: 1,
  total_pieces: 100,
  price_per_piece: 50.00,
  pieces_per_box: 10,
  remark: '默认备注',
  create_time: '2025-02-22 00:00:00',
  update_time: '2025-02-22 00:00:00'
}

// Search parameters
const category = ref<number | ''>('') // Product category
const surface = ref<number | ''>('') // Surface treatment
const searchResults = ref<any[]>([]) // Store search results
const total = ref(0) // Total records
const page = ref(1) // Current page
const size = ref(10) // Page size

// Dialog control for editing
const editDialogVisible = ref(false)
const editForm = ref({
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
  update_time: ''
})

// Category and surface treatment options（与数据库枚举一致）
const categoryOptions = [
  { label: '墙砖', value: 1 },
  { label: '地砖', value: 2 }
]
const surfaceOptions = [
  { label: '抛光', value: 1 },
  { label: '哑光', value: 2 },
  { label: '釉面', value: 3 },
  { label: '通体大理石', value: 4 },
  { label: '微晶石', value: 5 },
  { label: '岩板', value: 6 }
]

// Search function（匹配接口 /api/inventory/items）
const performSearch = async () => {
  try {
    const queryParams = new URLSearchParams({
      page: page.value.toString(),
      size: size.value.toString(),
      ...(category.value && { category: category.value.toString() }),
      ...(surface.value && { surface: surface.value.toString() })
    }).toString()

    const response = await fetch(`/api/inventory/items?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    if (data.code === 200 && data.data?.items) {
      searchResults.value = data.data.items
      total.value = data.data.total || 0
    } else {
      searchResults.value = [mockResult]
      total.value = 1
      ElMessage.warning('数据格式异常，已显示默认结果')
    }
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = [mockResult]
    total.value = 1
    ElMessage.warning('无法获取后端数据，已显示默认结果')
  }
}

// Edit record（匹配接口 /api/inventory/items/{id}）
const handleEdit = (row: any) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  try {
    const response = await fetch(`/api/inventory/items/${editForm.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!response.ok) throw new Error('编辑失败')
    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    await performSearch()
  } catch (error) {
    console.error('Failed to update inventory record:', error)
    ElMessage.error('编辑失败，请稍后重试')
  }
}

// Delete record（匹配接口 /api/inventory/items/{id}）
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此库存记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await fetch(`/api/inventory/items/${row.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('删除失败')
    ElMessage.success('删除成功')
    await performSearch()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete inventory record:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// Pagination handler
const handlePageChange = (newPage: number) => {
  page.value = newPage
  performSearch()
}

const handleSizeChange = (newSize: number) => {
  size.value = newSize
  performSearch()
}
</script>

<template>
  <h1>库存查询</h1>
  <hr>
  <div class="header-container">
    <div class="options-section">
      <div class="options-column">
        <div class="option-group">
          <div class="label">产品分类：</div>
          <el-radio-group v-model="category">
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
      <el-button
          type="primary"
          round
          class="search-btn"
          @click="performSearch"
      >
        搜索
      </el-button>
    </div>
  </div>
  <hr>

  <!-- Search Results -->
  <div class="results mt-4">
    <el-table
        v-if="searchResults.length > 0"
        :data="searchResults"
        style="width: 100%"
        border
    >
      <el-table-column prop="id" label="库存ID" width="80" />
      <el-table-column prop="model_number" label="产品型号" width="150" />
      <el-table-column prop="manufacturer" label="制造厂商" width="140" />
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
      <el-table-column prop="warehouse_num" label="仓库编码" width="120" />
      <el-table-column prop="total_pieces" label="总片数" width="120" />
      <el-table-column prop="pieces_per_box" label="每箱片数" width="100" />
      <el-table-column prop="price_per_piece" label="单片价格" width="150" />
      <el-table-column prop="remark" label="备注" width="200" />
      <el-table-column prop="create_time" label="创建时间" width="180" />
      <el-table-column prop="update_time" label="更新时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">
      {{ category || surface ? '暂无匹配数据' : '请输入搜索条件' }}
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑库存记录" width="30%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="产品型号">
          <el-input v-model="editForm.model_number" />
        </el-form-item>
        <el-form-item label="制造厂商">
          <el-input v-model="editForm.manufacturer" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="editForm.specification" />
        </el-form-item>
        <el-form-item label="表面处理">
          <el-select v-model="editForm.surface">
            <el-option
                v-for="item in surfaceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editForm.category">
            <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库编码">
          <el-input v-model.number="editForm.warehouse_num" type="number" disabled />
        </el-form-item>
        <el-form-item label="总片数">
          <el-input v-model.number="editForm.total_pieces" type="number" />
        </el-form-item>
        <el-form-item label="每箱片数">
          <el-input v-model.number="editForm.pieces_per_box" type="number" />
        </el-form-item>
        <el-form-item label="单片价格">
          <el-input v-model.number="editForm.price_per_piece" type="number" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>

  <!-- Pagination at the bottom center -->
  <div class="pagination-container">
    <el-pagination
        v-if="searchResults.length > 0"
        :current-page="page"
        :page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
    />
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
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
}

.options-column {
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
}

.option-group {
  display: flex;
  align-items: flex-start;
  gap: 1px;
  width: 100%;
}

.label {
  white-space: nowrap;
  padding-top: 4px;
  color: #606266;
  min-width: 80px;
}

.radio-item {
  margin-right: 10px;
}

.search-btn {
  height: auto;
  padding: 30px 30px;
  font-size: 16px;
}

.results {
  margin-top: 20px;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.mt-4 {
  margin-top: 16px;
}

/* Pagination styling */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 20px;
}
</style>