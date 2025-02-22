<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mocked fallback data
const mockRecord = {
  order_no: 'ORD123456',
  item_id: '1',
  model_number: 'TEST-MODEL',
  quantity: 10,
  adjusted_quantity: null,
  total_amount: 1000.00,
  adjusted_amount: null,
  customer_phone: '13812345678',
  operator_id: '1',
  order_remark: '测试订单',
  order_create_time: '2025-02-21 10:00:00',
  aftersale_type: null
}

// Store order records and search state
const orderRecords = ref<any[]>([])
const filteredRecords = ref<any[]>([])
const searchDateRange = ref<[Date, Date] | []>([])
const searchPhone = ref<string>('')

// Dialog control
const editDialogVisible = ref(false)
const editForm = ref({
  order_no: '',
  item_id: '',
  model_number: '',
  quantity: '',
  adjusted_quantity: null,
  total_amount: '',
  adjusted_amount: null,
  customer_phone: '',
  operator_id: '',
  order_remark: '',
  order_create_time: '',
  aftersale_type: null
})

// Define picker options for el-date-picker
const pickerOptions = {
  shortcuts: [
    {
      text: '最近一周',
      onClick(picker: any) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: '最近一个月',
      onClick(picker: any) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: '最近三个月',
      onClick(picker: any) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        picker.$emit('pick', [start, end])
      }
    }
  ],
  disabledDate(time: Date) {
    // 可选范围：过去10年到未来10年
    const now = new Date()
    const tenYearsAgo = now.getFullYear() - 10
    const tenYearsLater = now.getFullYear() + 10
    return time.getFullYear() < tenYearsAgo || time.getFullYear() > tenYearsLater
  }
}

// Fetch order records from API with fallback to mock data
const fetchOrderRecords = async () => {
  try {
    const response = await fetch('/api/order/list', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('API request failed')
    }
    const data = await response.json()
    const records = (data.records && data.records.length > 0) ? data.records : [mockRecord]
    orderRecords.value = records
    filteredRecords.value = records // Initialize filtered records
  } catch (error) {
    console.error('Failed to fetch order records:', error)
    orderRecords.value = [mockRecord]
    filteredRecords.value = [mockRecord]
    ElMessage.warning('无法获取后端数据，已显示默认记录')
  }
}

// Filter records by date range and phone
const filterRecords = () => {
  let result = [...orderRecords.value]

  // Filter by date range
  if (searchDateRange.value.length === 2) {
    const [startDate, endDate] = searchDateRange.value
    const startTime = new Date(startDate).setHours(0, 0, 0, 0)
    const endTime = new Date(endDate).setHours(23, 59, 59, 999)
    result = result.filter(record => {
      const recordTime = new Date(record.order_create_time).getTime()
      return recordTime >= startTime && recordTime <= endTime
    })
  }

  // Filter by phone
  if (searchPhone.value.trim()) {
    result = result.filter(record =>
        record.customer_phone.includes(searchPhone.value.trim())
    )
  }

  filteredRecords.value = result

  if (filteredRecords.value.length === 0) {
    ElMessage.info('所选条件范围内没有匹配的记录')
  }
}

// Load data on mount
onMounted(() => {
  fetchOrderRecords()
})

// Edit record
const handleEdit = (row: any) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  try {
    const response = await fetch(`/api/order/list/${editForm.value.order_no}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!response.ok) throw new Error('编辑失败')
    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    await fetchOrderRecords()
    filterRecords() // Re-apply filter after update
  } catch (error) {
    console.error('Failed to update order record:', error)
    ElMessage.error('编辑失败，请稍后重试')
  }
}

// Delete record
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此订单记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await fetch(`/api/order/list/${row.order_no}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('删除失败')
    ElMessage.success('删除成功')
    await fetchOrderRecords()
    filterRecords() // Re-apply filter after deletion
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete order record:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// Clear filter
const clearFilter = () => {
  searchDateRange.value = []
  searchPhone.value = ''
  filterRecords()
}

// Aftersale type mapping
const aftersaleTypeMap = {
  1: '买多退货退款',
  2: '买少补货补款'
}
</script>

<template>
  <h1>订单记录</h1>
  <hr>
  <div class="records-container">
    <!-- Search Section -->
    <el-row :gutter="20" class="search-section">
      <el-col :span="8">
        <el-form-item label="按日期筛选">
          <el-date-picker
              v-model="searchDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              @change="filterRecords"
          />
        </el-form-item>
      </el-col>
      <el-col :span="9">
        <el-form-item label="按手机号筛选">
          <el-input
              v-model="searchPhone"
              placeholder="输入客户手机号"
              clearable
              @input="filterRecords"
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
      <el-table-column prop="order_no" label="订单编号" width="150" />
      <el-table-column prop="item_id" label="库存商品ID" width="100" />
      <el-table-column prop="model_number" label="产品型号" width="100" />
      <el-table-column label="购买数量" width="100">
        <template #default="{ row }">
          <span>
            {{ row.aftersale_type ? row.adjusted_quantity : row.quantity }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="150">
        <template #default="{ row }">
          <span>
            {{ row.aftersale_type ? row.adjusted_amount : row.total_amount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="customer_phone" label="客户手机号" width="150" />
      <el-table-column prop="operator_id" label="操作人ID" width="120" />
      <el-table-column prop="order_remark" label="订单备注" min-width="200" />
      <el-table-column prop="order_create_time" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.order_create_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="售后类型" width="150">
        <template #default="{ row }">
          {{ row.aftersale_type ? aftersaleTypeMap[row.aftersale_type] : '无' }}
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
      暂无订单记录
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑订单记录" width="30%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="订单编号">
          <el-input v-model="editForm.order_no" disabled />
        </el-form-item>
        <el-form-item label="库存商品ID">
          <el-input v-model="editForm.item_id" />
        </el-form-item>
        <el-form-item label="产品型号">
          <el-input v-model="editForm.model_number" />
        </el-form-item>
        <el-form-item label="原始购买数量">
          <el-input v-model.number="editForm.quantity" type="number" />
        </el-form-item>
        <el-form-item label="调整后数量">
          <el-input v-model.number="editForm.adjusted_quantity" type="number" />
        </el-form-item>
        <el-form-item label="原始订单金额">
          <el-input v-model.number="editForm.total_amount" type="number" />
        </el-form-item>
        <el-form-item label="调整后金额">
          <el-input v-model.number="editForm.adjusted_amount" type="number" />
        </el-form-item>
        <el-form-item label="客户手机号">
          <el-input v-model="editForm.customer_phone" />
        </el-form-item>
        <el-form-item label="操作人ID">
          <el-input v-model="editForm.operator_id" />
        </el-form-item>
        <el-form-item label="订单备注">
          <el-input v-model="editForm.order_remark" type="textarea" />
        </el-form-item>
        <el-form-item label="售后类型">
          <el-select v-model="editForm.aftersale_type" placeholder="请选择售后类型">
            <el-option label="无" :value="null" />
            <el-option label="买多退货退款" :value="1" />
            <el-option label="买少补货补款" :value="2" />
          </el-select>
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