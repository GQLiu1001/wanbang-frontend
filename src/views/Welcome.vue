<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchTotalSalesAmount, fetchTodaySalesAmount, fetchSalesTrend, fetchTopProducts } from '@/api/order';

// 数据定义（初始为空，等待 API 填充）
const salesData = ref<{ dates: string[]; values: number[] }>({ dates: [], values: [] });
const topProducts = ref<{ model_number: string; sales: number; }[]>([]);
const totalSalesAmount = ref<number>(0);
const todaySalesAmount = ref<number>(0);

// Reference to the chart DOM element
const salesChartRef = ref<HTMLElement | null>(null);

// Fetch sales trend data from API
const fetchSalesData = async () => {
  try {
    const response = await fetchSalesTrend();
    salesData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch sales data:', error);
    ElMessage.warning('无法获取销量趋势数据，已显示默认数据');
    // 默认数据作为备用
    salesData.value = {
      dates: ['2024-12','2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'],
      values: [120, 200, 150, 330, 250, 400],
    };
  }
};

// Fetch top products from API
const fetchTopProductsData = async () => {
  try {
    const response = await fetchTopProducts();
    topProducts.value = response.data;
  } catch (error) {
    console.error('Failed to fetch top products:', error);
    ElMessage.warning('无法获取最火爆卖品数据，已显示默认数据');
    // 默认数据作为备用
    topProducts.value = [
      { model_number: 'MODEL-A', sales: 500},
      { model_number: 'MODEL-B', sales: 450},
      { model_number: 'MODEL-C', sales: 300},
      { model_number: 'MODEL-D', sales: 200},
      { model_number: 'MODEL-E', sales: 150},
    ];
  }
};

// Initialize sales chart
const initSalesChart = () => {
  if (!salesChartRef.value) return;

  const chart = echarts.init(salesChartRef.value);
  const option = {
    title: {
      text: '销量趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: salesData.value.dates,
    },
    yAxis: {
      type: 'value',
      name: '销量',
    },
    series: [
      {
        name: '销量',
        type: 'line',
        data: salesData.value.values,
        smooth: true,
        lineStyle: {
          color: '#409EFF',
        },
        itemStyle: {
          color: '#409EFF',
        },
      },
    ],
  };
  chart.setOption(option);

  // Resize chart on window resize
  window.addEventListener('resize', () => chart.resize());
};

// Load data and initialize chart on mount
onMounted(async () => {
  // 获取所有数据
  try {
    const totalResponse = await fetchTotalSalesAmount();
    totalSalesAmount.value = totalResponse.data.total_amount;
  } catch (error) {
    console.error('Failed to fetch total sales amount:', error);
    ElMessage.warning('无法获取总销售金额，已显示默认数据');
    totalSalesAmount.value = 150000;
  }

  try {
    const todayResponse = await fetchTodaySalesAmount();
    todaySalesAmount.value = todayResponse.data.today_amount;
  } catch (error) {
    console.error('Failed to fetch today sales amount:', error);
    ElMessage.warning('无法获取今日销售金额，已显示默认数据');
    todaySalesAmount.value = 5000;
  }

  await fetchSalesData();
  await fetchTopProductsData();
  initSalesChart();
});
</script>

<template>
  <div class="welcome-container">
    <h1>欢迎来到万邦陶瓷库存管理系统</h1>
    <hr />

    <!-- 订单总销售金额和今日销售金额 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :span="12">
        <el-card shadow="hover" class="rounded-card stats-card">
          <h3>订单总销售金额</h3>
          <p class="stats-value">{{ totalSalesAmount }} 元</p>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="rounded-card stats-card">
          <h3>今日销售金额</h3>
          <p class="stats-value">{{ todaySalesAmount }} 元</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表部分 -->
    <el-row :gutter="20" class="charts-section">
      <!-- Sales Trend Chart -->
      <el-col :span="16">
        <el-card shadow="hover" class="rounded-card">
          <section ref="salesChartRef" class="sales-chart"></section>
        </el-card>
      </el-col>

      <!-- Top Products Table -->
      <el-col :span="8">
        <el-card shadow="hover" class="rounded-card">
          <h3>最火爆卖品</h3>
          <el-table :data="topProducts" style="width: 100%" border height="350">
            <el-table-column prop="model_number" label="产品型号" />
            <el-table-column prop="sales" label="销量" />
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

.stats-section {
  margin-top: 20px;
  margin-bottom: 20px;
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

/* 统计卡片样式 */
.stats-card {
  text-align: center;
}

.stats-value {
  font-size: 24px;
  color: #409EFF;
  margin: 10px 0 0 0;
}

/* 添加圆角样式 */
.rounded-card {
  border-radius: 15px;
  overflow: hidden;
}
</style>