<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mocked fallback data
const mockResult = {
  productModel: '默认型号',
  manufacturer: '默认厂商',
  specification: '默认规格',
  warehouseCode: 'WH001',
  totalPieces: 100,
  boxCount: 10,
  piecesPerBox: 10,
  unitPrice: 50.00
}

// Search parameters
const value = ref('') // Selected option（此处未使用，可保留）
const category = ref('') // Product category
const surface = ref('') // Surface treatment
const searchResults = ref<any[]>([]) // Store search results

// Dialog control for editing
const editDialogVisible = ref(false)
const editForm = ref({
  productModel: '',
  manufacturer: '',
  specification: '',
  warehouseCode: '',
  totalPieces: 0,
  boxCount: 0,
  piecesPerBox: 0,
  unitPrice: 0
})

// Category and surface treatment options
const categoryOptions = ['墙砖', '地砖']
const surfaceOptions = ['抛光', '哑光', '釉面', '通体大理石', '微晶石', '岩板']

// Search function with fallback to mock data
const performSearch = async () => {
  try {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productType: value.value,
        category: category.value,
        surface: surface.value
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    searchResults.value = (data.results && data.results.length > 0) ? data.results : [mockResult]
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = [mockResult]
    ElMessage.warning('无法获取后端数据，已显示默认结果')
  }
}

// Edit record
const handleEdit = (row: any) => {
  editForm.value = { ...row } // Clone the row data into the edit form
  editDialogVisible.value = true
}

const saveEdit = async () => {
  try {
    const response = await fetch(`/api/inventory/${editForm.value.warehouseCode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!response.ok) throw new Error('编辑失败')
    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    await performSearch() // Refresh the list
  } catch (error) {
    console.error('Failed to update inventory record:', error)
    ElMessage.error('编辑失败，请稍后重试')
  }
}

// Delete record
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此库存记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await fetch(`/api/inventory/${row.warehouseCode}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('删除失败')
    ElMessage.success('删除成功')
    await performSearch() // Refresh the list
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete inventory record:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
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
                :key="item"
                :label="item"
                class="radio-item"
            >
              {{ item }}
            </el-radio>
          </el-radio-group>
        </div>
        <div class="option-group">
          <div class="label">表面处理：</div>
          <el-radio-group v-model="surface">
            <el-radio
                v-for="item in surfaceOptions"
                :key="item"
                :label="item"
                class="radio-item"
            >
              {{ item }}
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
      <el-table-column prop="inventoryId" label="库存id" width="80" />
      <el-table-column prop="productModel" label="产品型号" width="150" />
      <el-table-column prop="manufacturer" label="制造厂商" width="140" />
      <el-table-column prop="specification" label="规格" width="120" />
      <el-table-column prop="warehouseCode" label="仓库编码" width="120" />
      <el-table-column prop="totalPieces" label="总片数" width="120" />
      <el-table-column prop="boxCount" label="箱数" width="100" />
      <el-table-column prop="piecesPerBox" label="每箱片数" width="100" />
      <el-table-column prop="unitPrice" label="单片价格" width="150" />
      <el-table-column label="操作" width="150">
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
          <el-input v-model="editForm.productModel" />
        </el-form-item>
        <el-form-item label="制造厂商">
          <el-input v-model="editForm.manufacturer" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="editForm.specification" />
        </el-form-item>
        <el-form-item label="仓库编码">
          <el-input v-model="editForm.warehouseCode" disabled />
        </el-form-item>
        <el-form-item label="总片数">
          <el-input v-model.number="editForm.totalPieces" type="number" />
        </el-form-item>
        <el-form-item label="箱数">
          <el-input v-model.number="editForm.boxCount" type="number" />
        </el-form-item>
        <el-form-item label="每箱片数">
          <el-input v-model.number="editForm.piecesPerBox" type="number" />
        </el-form-item>
        <el-form-item label="单片价格">
          <el-input v-model.number="editForm.unitPrice" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
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
</style>