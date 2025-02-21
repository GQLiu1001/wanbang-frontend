<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

// Mocked data for sales trend
const salesData = ref({
  dates: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'],
  values: [120, 200, 150, 300, 250, 400]
})

// Mocked data for top products
const topProducts = ref([
  { model_number: 'MODEL-A', sales: 500, total_amount: 50000 },
  { model_number: 'MODEL-B', sales: 450, total_amount: 45000 },
  { model_number: 'MODEL-C', sales: 300, total_amount: 30000 },
  { model_number: 'MODEL-D', sales: 200, total_amount: 20000 },
  { model_number: 'MODEL-E', sales: 150, total_amount: 15000 }
])

// Reference to the chart DOM element
const salesChartRef = ref<HTMLElement | null>(null)

// Fetch sales data from API (mocked here)
const fetchSalesData = async () => {
  try {
    // Simulated API call
    // const response = await fetch('/api/sales/trend', { method: 'GET' })
    // const data = await response.json()
    // salesData.value = data
  } catch (error) {
    console.error('Failed to fetch sales data:', error)
    ElMessage.warning('无法获取销量数据，已显示默认数据')
  }
}

// Fetch top products from API (mocked here)
const fetchTopProducts = async () => {
  try {
    // Simulated API call
    // const response = await fetch('/api/sales/top-products', { method: 'GET' })
    // const data = await response.json()
    // topProducts.value = data
  } catch (error) {
    console.error('Failed to fetch top products:', error)
    ElMessage.warning('无法获取最火爆卖品数据，已显示默认数据')
  }
}

// Initialize sales chart
const initSalesChart = () => {
  if (!salesChartRef.value) return

  const chart = echarts.init(salesChartRef.value)
  const option = {
    title: {
      text: '销量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: salesData.value.dates
    },
    yAxis: {
      type: 'value',
      name: '销量'
    },
    series: [
      {
        name: '销量',
        type: 'line',
        data: salesData.value.values,
        smooth: true,
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  chart.setOption(option)

  // Resize chart on window resize
  window.addEventListener('resize', () => chart.resize())
}

// Load data and initialize chart on mount
onMounted(() => {
  fetchSalesData()
  fetchTopProducts()
  initSalesChart()
})
</script>

<template>
  <div class="welcome-container">
    <h1>欢迎来到万邦陶瓷库存管理系统</h1>
    <hr>
    <el-row :gutter="20" class="charts-section">
      <!-- Sales Trend Chart -->
      <el-col :span="16">
        <el-card shadow="hover">
          <section ref="salesChartRef" class="sales-chart"></section>
        </el-card>
      </el-col>

      <!-- Top Products Table -->
      <el-col :span="8">
        <el-card shadow="hover">
          <h3>最火爆卖品</h3>
          <el-table
              :data="topProducts"
              style="width: 100vw"
              border
              height="400"
          >
            <el-table-column prop="model_number" label="产品型号"  />
            <el-table-column prop="sales" label="销量"  />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.welcome-container {
  padding: 20px;
}

.charts-section {
  margin-top: 20px;
}

.sales-chart {
  width: 100%;
  height: 400px;
}

h1 {
  text-align: center;
  color: #409EFF;
}

h3 {
  text-align: center;
  margin-bottom: 10px;
}
</style>