<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mocked fallback data（与inventory_log表字段一致）
const mockRecord = {
  id: 1,
  inventory_item_id: 1,
  operation_type: 2, // 固定为出库
  quantity_change: -100, // 出库数量为负数
  operator_id: 1,
  source_warehouse: 1,
  target_warehouse: null,
  remark: '默认出库备注',
  create_time: '2025-02-22 14:00:00',
  update_time: '2025-02-22 14:00:00'
}

// Store outbound inventory records and search state
const outboundRecords = ref<any[]>([])
const total = ref(0) // Total records
const page = ref(1) // Current page
const size = ref(10) // Page size
const searchDateRange = ref<[Date, Date] | []>([])

// Dialog control
const editDialogVisible = ref(false)
const editForm = ref({
  id: 0,
  inventory_item_id: 0,
  operation_type: 2, // 固定为出库
  quantity_change: 0,
  operator_id: 0,
  source_warehouse: <number | null>null,
  target_warehouse: <number | null>null,
  remark: '',
  create_time: '',
  update_time: ''
})

// Define picker options for el-date-picker
const pickerOptions = {
  disabledDate(time: Date) {
    const now = new Date()
    const tenYearsAgo = now.getFullYear() - 10
    const tenYearsLater = now.getFullYear() + 10
    return time.getFullYear() < tenYearsAgo || time.getFullYear() > tenYearsLater
  }
}

// Fetch outbound inventory records from API（限定operation_type=2）
const fetchOutboundRecords = async () => {
  try {
    const url = new URL('/api/inventory/logs', window.location.origin)
    url.searchParams.append('operation_type', '2') // 限定为出库记录
    url.searchParams.append('page', page.value.toString())
    url.searchParams.append('size', size.value.toString())
    if (searchDateRange.value.length === 2) {
      const [startDate, endDate] = searchDateRange.value
      url.searchParams.append('start_time', new Date(startDate).toISOString().slice(0, 19).replace('T', ' '))
      url.searchParams.append('end_time', new Date(endDate).toISOString().slice(0, 19).replace('T', ' '))
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('API request failed')
    }
    const data = await response.json()
    if (data.code === 200 && data.data?.items) {
      outboundRecords.value = data.data.items
      total.value = data.data.total || 0
    } else {
      outboundRecords.value = [mockRecord]
      total.value = 1
      ElMessage.warning('数据格式异常，已显示默认记录')
    }
  } catch (error) {
    console.error('Failed to fetch outbound records:', error)
    outboundRecords.value = [mockRecord]
    total.value = 1
    ElMessage.warning('无法获取后端数据，已显示默认记录')
  }
}

// Load data on mount
onMounted(() => {
  fetchOutboundRecords()
})

// Edit record（匹配接口 /api/inventory/logs/{id}）
const handleEdit = (row: any) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  try {
    // 确保 operation_type 固定为 2，且 quantity_change 为负数
    editForm.value.operation_type = 2
    if (editForm.value.quantity_change > 0) {
      editForm.value.quantity_change = -Math.abs(editForm.value.quantity_change)
    }
    const response = await fetch(`/api/inventory/logs/${editForm.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!response.ok) throw new Error('编辑失败')
    const data = await response.json()
    if (data.code === 200) {
      ElMessage.success('编辑成功')
      editDialogVisible.value = false
      await fetchOutboundRecords()
    } else {
      throw new Error('响应状态异常')
    }
  } catch (error) {
    console.error('Failed to update outbound record:', error)
    ElMessage.error('编辑失败，请稍后重试')
  }
}

// Delete record（匹配接口 /api/inventory/logs/{id}）
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此出库记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await fetch(`/api/inventory/logs/${row.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('删除失败')
    const data = await response.json()
    if (data.code === 200) {
      ElMessage.success('删除成功')
      await fetchOutboundRecords()
    } else {
      throw new Error('响应状态异常')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete outbound record:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// Pagination handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchOutboundRecords()
}

const handleSizeChange = (newSize: number) => {
  size.value = newSize
  page.value = 1 // 重置到第一页
  fetchOutboundRecords()
}

// Clear filter and refresh
const clearFilter = () => {
  searchDateRange.value = []
  page.value = 1 // 重置到第一页
  fetchOutboundRecords()
}
</script>

<template>
  <h1>出库记录</h1>
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
              @change="fetchOutboundRecords"
          />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button @click="clearFilter">清除筛选</el-button>
      </el-col>
    </el-row>

    <el-table
        v-if="outboundRecords.length > 0"
        :data="outboundRecords"
        style="width: 100%"
        border
    >
      <el-table-column prop="id" label="日志ID" width="100" />
      <el-table-column prop="inventory_item_id" label="库存ID" width="120" />
      <el-table-column prop="quantity_change" label="数量变化" width="120">
        <template #default="{ row }">
          <span class="negative">{{ row.quantity_change }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="operator_id" label="操作人ID" width="120" />
      <el-table-column prop="source_warehouse" label="源仓库编码" width="150" />
      <el-table-column prop="target_warehouse" label="目标仓库编码" width="150" />
      <el-table-column prop="remark" label="操作备注" min-width="200" />
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.create_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="update_time" label="更新时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.update_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">
      暂无出库记录
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
          v-if="outboundRecords.length > 0"
          :current-page="page"
          :page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑出库记录" width="30%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="库存ID">
          <el-input v-model.number="editForm.inventory_item_id" disabled />
        </el-form-item>
        <el-form-item label="数量变化">
          <el-input v-model.number="editForm.quantity_change" type="number" :max="0" placeholder="请输入负数" />
        </el-form-item>
        <el-form-item label="操作人ID">
          <el-input v-model.number="editForm.operator_id" type="number" />
        </el-form-item>
        <el-form-item label="源仓库编码">
          <el-input v-model.number="editForm.source_warehouse" type="number" />
        </el-form-item>
        <el-form-item label="目标仓库编码">
          <el-input v-model.number="editForm.target_warehouse" type="number" />
        </el-form-item>
        <el-form-item label="操作备注">
          <el-input v-model="editForm.remark" type="textarea" />
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

.negative {
  color: red;
}

.search-section {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px; /* 与上一个版本一致的分页间距 */
  padding-bottom: 20px;
}
</style>