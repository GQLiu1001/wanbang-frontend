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
  order_update_time: '2025-02-21 10:00:00',
  aftersale_type: null, // 确保包含售后类型
  aftersale_status: null // 确保包含售后状态
}

// Store order records and search state
const orderRecords = ref<any[]>([])
const filteredRecords = ref<any[]>([])
const searchDateRange = ref<[Date, Date] | []>([])

// Dialog control for aftersale
const aftersaleDialogVisible = ref(false)
const aftersaleForm = ref({
  order_no: '',                // 订单编号
  aftersale_type: null,        // 售后类型
  aftersale_status: null,      // 售后状态
  quantity_change: 0,          // 数量变化（负数退货，正数补货）
  amount_change: 0,            // 金额变化（负数退款，正数补款）
  resolution_result: '',       // 处理结果说明
  aftersale_operator: '',      // 售后处理人ID
  create_time: ''              // 创建时间
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
    const now = new Date()
    const tenYearsAgo = now.getFullYear() - 10
    const tenYearsLater = now.getFullYear() + 10
    return time.getFullYear() < tenYearsAgo || time.getFullYear() > tenYearsLater
  }
}

// Fetch order records from API with fallback to mock data
const fetchOrderRecords = async () => {
  try {
    const url = new URL('/api/orders', window.location.origin)
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
    const records = (data.data?.items && data.data.items.length > 0) ? data.data.items : [mockRecord]
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
  fetchOrderRecords() // 直接调用API重新获取数据
}

// Load data on mount
onMounted(() => {
  fetchOrderRecords()
})

// Handle aftersale
const handleAftersale = (row: any) => {
  aftersaleForm.value = {
    order_no: row.order_no,
    aftersale_type: null,
    aftersale_status: null,
    quantity_change: 0,
    amount_change: 0,
    resolution_result: '',
    aftersale_operator: '',
    create_time: new Date().toLocaleString()
  }
  aftersaleDialogVisible.value = true
}

const saveAftersale = async () => {
  try {
    const response = await fetch('/api/aftersales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aftersaleForm.value),
    })
    if (!response.ok) throw new Error('售后记录创建失败')
    const data = await response.json()
    if (data.code === 201) {
      ElMessage.success('售后记录创建成功')
      aftersaleDialogVisible.value = false
      await fetchOrderRecords()
      filterByDateRange() // Re-apply filter after update
    } else {
      throw new Error('响应状态异常')
    }
  } catch (error) {
    console.error('Failed to create aftersale record:', error)
    ElMessage.error('售后记录创建失败，请稍后重试')
  }
}

// Clear filter
const clearFilter = () => {
  searchDateRange.value = []
  fetchOrderRecords()
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
            {{ row.aftersale_type ? row.adjusted_quantity || row.quantity : row.quantity }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="150">
        <template #default="{ row }">
          <span>
            {{ row.aftersale_type ? row.adjusted_amount || row.total_amount : row.total_amount }}
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
      <el-table-column prop="order_update_time" label="更新时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.order_update_time).toLocaleString() }}
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="warning" size="small" @click="handleAftersale(row)">售后</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">
      暂无订单记录
    </div>

    <!-- Aftersale Dialog -->
    <el-dialog v-model="aftersaleDialogVisible" title="创建售后记录" width="30%">
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
        <el-form-item label="数量变化" required>
          <el-input v-model.number="aftersaleForm.quantity_change" type="number" placeholder="负数退货，正数补货" />
        </el-form-item>
        <el-form-item label="金额变化" required>
          <el-input v-model.number="aftersaleForm.amount_change" type="number" step="0.01" placeholder="负数退款，正数补款" />
        </el-form-item>
        <el-form-item label="处理结果说明">
          <el-input v-model="aftersaleForm.resolution_result" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="售后处理人" required>
          <el-input v-model="aftersaleForm.aftersale_operator" placeholder="请输入处理人ID" />
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

.search-section {
  margin-bottom: 20px;
}
</style>