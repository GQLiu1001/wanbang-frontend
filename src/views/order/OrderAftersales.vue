<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

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
  aftersale_type: null,
  aftersale_status: null
}

// Store order records and search state
const orderRecords = ref<any[]>([])
const filteredRecords = ref<any[]>([])
const searchDateRange = ref<[Date, Date] | []>([])

// Dialog control for aftersale
const aftersaleDialogVisible = ref(false)
const aftersaleForm = ref({
  aftersale_type: null,       // 售后类型
  aftersale_status: null,     // 售后状态
  adjusted_quantity: '',      // 调整后数量
  adjusted_amount: '',        // 调整后价格
  resolution_result: '',      // 处理结果说明
  aftersale_operator: '',     // 售后处理人ID
  create_time: '',            // 创建时间
  order_no: ''                // 添加 order_no 用于保存时关联订单
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

// Filter records by date range
const filterByDateRange = () => {
  if (searchDateRange.value.length === 0) {
    filteredRecords.value = [...orderRecords.value]
    return
  }
  const [startDate, endDate] = searchDateRange.value
  const startTime = new Date(startDate).setHours(0, 0, 0, 0)
  const endTime = new Date(endDate).setHours(23, 59, 59, 999)

  filteredRecords.value = orderRecords.value.filter(record => {
    const recordTime = new Date(record.order_create_time).getTime()
    return recordTime >= startTime && recordTime <= endTime
  })

  if (filteredRecords.value.length === 0) {
    ElMessage.info('所选日期范围内没有匹配的记录')
  }
}

// Load data on mount
onMounted(() => {
  fetchOrderRecords()
})

// Handle aftersale
const handleAftersale = (row: any) => {
  aftersaleForm.value = {
    aftersale_type: row.aftersale_type || null,
    aftersale_status: row.aftersale_status || null,
    adjusted_quantity: row.adjusted_quantity || row.quantity || '',
    adjusted_amount: row.adjusted_amount || row.total_amount || '',
    resolution_result: '',
    aftersale_operator: '',
    create_time: new Date().toLocaleString(),
    order_no: row.order_no // 绑定订单编号
  }
  aftersaleDialogVisible.value = true
}

const saveAftersale = async () => {
  try {
    const response = await fetch(`/api/order/aftersale/${aftersaleForm.value.order_no}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aftersaleForm.value),
    })
    if (!response.ok) throw new Error('售后处理失败')
    ElMessage.success('售后处理成功')
    aftersaleDialogVisible.value = false
    await fetchOrderRecords()
    filterByDateRange() // Re-apply filter after update
  } catch (error) {
    console.error('Failed to process aftersale:', error)
    ElMessage.error('售后处理失败，请稍后重试')
  }
}

// Clear filter
const clearFilter = () => {
  searchDateRange.value = []
  filterByDateRange()
}

// Aftersale type and status mapping
const aftersaleTypeMap = {
  1: '买多退货退款',
  2: '买少补货补款'
}

const aftersaleStatusMap = {
  1: '新建',
  2: '已解决'
}
</script>

<template>
  <h1>售后管理</h1>
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
      <el-table-column prop="order_no" label="订单编号" width="150" />
      <el-table-column prop="item_id" label="库存商品ID" width="120" />
      <el-table-column prop="model_number" label="产品型号" width="150" />
      <el-table-column label="购买数量" width="120">
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
      <el-table-column label="售后状态" width="120">
        <template #default="{ row }">
          {{ row.aftersale_status ? aftersaleStatusMap[row.aftersale_status] : '无' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="warning" size="small" @click="handleAftersale(row)">售后</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">
      暂无订单记录
    </div>

    <!-- Aftersale Dialog -->
    <el-dialog v-model="aftersaleDialogVisible" title="售后处理" width="30%">
      <el-form :model="aftersaleForm" label-width="120px">
        <el-form-item label="订单编号">
          <el-input v-model="aftersaleForm.order_no" disabled />
        </el-form-item>
        <el-form-item label="售后类型" required>
          <el-select v-model="aftersaleForm.aftersale_type" placeholder="请选择售后类型">
            <el-option label="买多退货退款" :value="1" />
            <el-option label="买少补货补款" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="售后状态" required>
          <el-select v-model="aftersaleForm.aftersale_status" placeholder="请选择售后状态">
            <el-option label="新建" :value="1" />
            <el-option label="已解决" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整后数量" required>
          <el-input v-model.number="aftersaleForm.adjusted_quantity" type="number" />
        </el-form-item>
        <el-form-item label="调整后价格" required>
          <el-input v-model.number="aftersaleForm.adjusted_amount" type="number" step="0.01" />
        </el-form-item>
        <el-form-item label="处理结果说明">
          <el-input v-model="aftersaleForm.resolution_result" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="售后处理人" required>
          <el-input v-model="aftersaleForm.aftersale_operator" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="aftersaleForm.create_time" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="aftersaleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAftersale">保存</el-button>
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