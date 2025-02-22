<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mocked fallback data
const mockRecord = {
  productModel: '1',
  inventoryId: '1',
  quantityChange: '1',
  operatorId: '1',
  targetWarehouseCode: '1',
  operationNote: '1',
  create_time: '1'
}

// Store inventory records and search state
const inventoryRecords = ref<any[]>([])
const filteredRecords = ref<any[]>([])
const searchDateRange = ref<[Date, Date] | []>([])

// Dialog control
const editDialogVisible = ref(false)
const editForm = ref({
  productModel: '',
  inventoryId: '',
  quantityChange: '',
  operatorId: '',
  targetWarehouseCode: '',
  operationNote: '',
  create_time: ''
})

// Define picker options for el-date-picker
const pickerOptions = {
  disabledDate(time: Date) {
    // 可选范围：过去10年到未来10年
    const now = new Date()
    const tenYearsAgo = now.getFullYear() - 10
    const tenYearsLater = now.getFullYear() + 10
    return time.getFullYear() < tenYearsAgo || time.getFullYear() > tenYearsLater
  }
}

// Fetch inventory records from API with fallback to mock data
const fetchInventoryRecords = async () => {
  try {
    const response = await fetch('/api/inventory/records', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('API request failed')
    }
    const data = await response.json()
    const records = (data.records && data.records.length > 0) ? data.records : [mockRecord]
    inventoryRecords.value = records
    filteredRecords.value = records
  } catch (error) {
    console.error('Failed to fetch inventory records:', error)
    inventoryRecords.value = [mockRecord]
    filteredRecords.value = [mockRecord]
    ElMessage.warning('无法获取后端数据，已显示默认记录')
  }
}

// Filter records by date
const filterByDateRange = () => {
  if (searchDateRange.value.length === 0) {
    filteredRecords.value = [...inventoryRecords.value]
    return
  }
  const [startDate, endDate] = searchDateRange.value
  const startTime = new Date(startDate).setHours(0, 0, 0, 0)
  const endTime = new Date(endDate).setHours(23, 59, 59, 999)

  filteredRecords.value = inventoryRecords.value.filter(record => {
    const recordTime = new Date(record.create_time).getTime()
    return recordTime >= startTime && recordTime <= endTime
  })

  if (filteredRecords.value.length === 0) {
    ElMessage.info('所选日期范围内没有匹配的记录')
  }
}

// Load data on mount
onMounted(() => {
  fetchInventoryRecords()
})

// Edit record
const handleEdit = (row: any) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  try {
    const response = await fetch(`/api/inventory/records/${editForm.value.inventoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!response.ok) throw new Error('编辑失败')
    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    await fetchInventoryRecords()
    filterByDateRange()
  } catch (error) {
    console.error('Failed to update record:', error)
    ElMessage.error('编辑失败，请稍后重试')
  }
}

// Delete record
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此入库记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await fetch(`/api/inventory/records/${row.inventoryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('删除失败')
    ElMessage.success('删除成功')
    await fetchInventoryRecords()
    filterByDateRange()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete record:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// Clear filter
const clearFilter = () => {
  searchDateRange.value = []
  filterByDateRange()
}
</script>

<template>
  <h1>入库记录</h1>
  <hr>
  <div class="records-container">
    <!-- Search Section -->
    <el-row :gutter="20" class="search-section">
      <el-col :span="8">
        <el-form-item label="按日期筛选">
          <el-date-picker
              v-model="searchDateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              @change="filterByDateRange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button @click="clearFilter">清除筛选</el-button>
      </el-col>
    </el-row>

    <el-table
        v-if="filteredRecords.length > 0"
        :data="filteredRecords"
        style="width: 100%"
        border
    >
      <el-table-column prop="productModel" label="产品型号" width="150" />
      <el-table-column prop="inventoryId" label="库存ID" width="120" />
      <el-table-column prop="quantityChange" label="数量变化" width="120">
        <template #default="{ row }">
          <span :class="{ 'positive': row.quantityChange > 0, 'negative': row.quantityChange < 0 }">
            {{ row.quantityChange > 0 ? '+' : '' }}{{ row.quantityChange }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="operatorId" label="操作人ID" width="120" />
      <el-table-column prop="targetWarehouseCode" label="目标仓库编码" width="150" />
      <el-table-column prop="operationNote" label="操作备注" min-width="200" />
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.create_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">
      暂无入库记录
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑入库记录" width="30%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="产品型号">
          <el-input v-model="editForm.productModel" />
        </el-form-item>
        <el-form-item label="库存ID">
          <el-input v-model="editForm.inventoryId" disabled />
        </el-form-item>
        <el-form-item label="数量变化">
          <el-input v-model.number="editForm.quantityChange" type="number" />
        </el-form-item>
        <el-form-item label="操作人ID">
          <el-input v-model="editForm.operatorId" />
        </el-form-item>
        <el-form-item label="目标仓库编码">
          <el-input v-model="editForm.targetWarehouseCode" />
        </el-form-item>
        <el-form-item label="操作备注">
          <el-input v-model="editForm.operationNote" type="textarea" />
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
.records-container {
  margin-top: 20px;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.search-section {
  margin-bottom: 20px;
}
</style>