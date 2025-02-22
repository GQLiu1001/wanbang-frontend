<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mocked fallback data
const mockRecord = {
  productModel: '1',
  inventoryId: '1',
  quantityChange: '1',
  operatorId: '1',
  sourceWarehouseCode: '1',
  operationNote: '1',
  create_time: '1'
}

// Store outbound inventory records
const outboundRecords = ref<any[]>([])

// Dialog control
const editDialogVisible = ref(false)
const editForm = ref({
  productModel: '',
  inventoryId: '',
  quantityChange: '',
  operatorId: '',
  sourceWarehouseCode: '',
  operationNote: '',
  create_time: ''
})

// Fetch outbound inventory records from API with fallback to mock data
const fetchOutboundRecords = async () => {
  try {
    const response = await fetch('/api/inventory/outbound-records', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('API request failed')
    }
    const data = await response.json()
    // If no records are returned, use the mock data
    outboundRecords.value = (data.records && data.records.length > 0) ? data.records : [mockRecord]
  } catch (error) {
    console.error('Failed to fetch outbound records:', error)
    // Fallback to mock data on error
    outboundRecords.value = [mockRecord]
    ElMessage.warning('无法获取后端数据，已显示默认记录')
  }
}

// Load data on mount
onMounted(() => {
  fetchOutboundRecords()
})

// Edit record
const handleEdit = (row: any) => {
  editForm.value = { ...row } // Clone the row data into the edit form
  editDialogVisible.value = true
}

const saveEdit = async () => {
  try {
    const response = await fetch(`/api/inventory/outbound-records/${editForm.value.inventoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!response.ok) throw new Error('编辑失败')
    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    await fetchOutboundRecords() // Refresh the list
  } catch (error) {
    console.error('Failed to update outbound record:', error)
    ElMessage.error('编辑失败，请稍后重试')
  }
}

// Delete record
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此出库记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await fetch(`/api/inventory/outbound-records/${row.inventoryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('删除失败')
    ElMessage.success('删除成功')
    await fetchOutboundRecords() // Refresh the list
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete outbound record:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}
</script>

<template>
  <h1>出库记录</h1>
  <hr>
  <div class="records-container">
    <el-table
        v-if="outboundRecords.length > 0"
        :data="outboundRecords"
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
      <el-table-column prop="sourceWarehouseCode" label="源仓库编码" width="150" />
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
      暂无出库记录
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑出库记录" width="30%">
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
        <el-form-item label="源仓库编码">
          <el-input v-model="editForm.sourceWarehouseCode" />
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
</style>