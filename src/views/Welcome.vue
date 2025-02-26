<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchTotalSalesAmount, fetchTodaySalesAmount, fetchSalesTrend, fetchTopProducts } from '@/api/order';

// 数据定义（初始为空，等待 API 填充）
const salesData = ref<{ dates: string[]; salesValues: number[]; amounts: number[] }>({ dates: [], salesValues: [], amounts: [] });
const topProducts = ref<{ model_number: string; sales: number; }[]>([]);
const totalSalesAmount = ref<number>(0);
const todaySalesAmount = ref<number>(0);

// 引用图表 DOM 元素
const salesChartRef = ref<HTMLElement | null>(null);

// 获取销售趋势数据
const fetchSalesData = async () => {
  try {
    const response = await fetchSalesTrend();
    salesData.value = response.data; // 确保从 response.data 中获取数据
  } catch (error) {
    console.error('获取销售趋势数据失败：', error);
    ElMessage.warning('无法获取销量趋势数据，已显示默认数据');
    // 默认数据作为备用
    salesData.value = {
      dates: ['2024-09', '2024-10', '2024-11', '2024-12', '2025-01'],
      salesValues: [100, 90, 120, 133, 566],
      amounts: [9000, 7500, 23333, 12500, 123333],
    };
  }
};

// 获取最火爆卖品数据
const fetchTopProductsData = async () => {
  try {
    const response = await fetchTopProducts();
    topProducts.value = response.data;
  } catch (error) {
    console.error('获取最火爆卖品数据失败：', error);
    ElMessage.warning('无法获取最火爆卖品数据，已显示默认数据');
    // 默认数据作为备用
    topProducts.value = [
      { model_number: 'MODEL-A', sales: 500 },
      { model_number: 'MODEL-B', sales: 450 },
      { model_number: 'MODEL-C', sales: 300 },
      { model_number: 'MODEL-D', sales: 200 },
      { model_number: 'MODEL-E', sales: 150 },
    ];
  }
};

// 初始化销售趋势图表
const initSalesChart = () => {
  if (!salesChartRef.value) return;

  const chart = echarts.init(salesChartRef.value);
  const option = {
    title: {
      text: '销售趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['销量', '销售金额'],
      top: '5%',
    },
    xAxis: {
      type: 'category',
      data: salesData.value.dates,
    },
    yAxis: [
      {
        type: 'value',
        name: '销量',
        position: 'left',
      },
      {
        type: 'value',
        name: '销售金额（元）',
        position: 'right',
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
    series: [
      {
        name: '销量',
        type: 'line',
        data: salesData.value.salesValues,
        smooth: true,
        yAxisIndex: 0, // 使用左边的 Y 轴
        lineStyle: {
          color: '#409EFF',
        },
        itemStyle: {
          color: '#409EFF',
        },
      },
      {
        name: '销售金额',
        type: 'line',
        data: salesData.value.amounts,
        smooth: true,
        yAxisIndex: 1, // 使用右边的 Y 轴
        lineStyle: {
          color: '#67C23A',
        },
        itemStyle: {
          color: '#67C23A',
        },
      },
    ],
  };
  chart.setOption(option);

  // 窗口大小变化时调整图表大小
  window.addEventListener('resize', () => chart.resize());
};

// 组件挂载时加载数据并初始化图表
onMounted(async () => {
  // 获取所有数据
  try {
    const totalResponse = await fetchTotalSalesAmount();
    totalSalesAmount.value = totalResponse.data.total_amount;
  } catch (error) {
    console.error('获取总销售金额失败：', error);
    ElMessage.warning('无法获取总销售金额，已显示默认数据');
    totalSalesAmount.value = 150000;
  }

  try {
    const todayResponse = await fetchTodaySalesAmount();
    todaySalesAmount.value = todayResponse.data.today_amount;
  } catch (error) {
    console.error('获取今日销售金额失败：', error);
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
      <!-- 销售趋势图 -->
      <el-col :span="16">
        <el-card shadow="hover" class="rounded-card">
          <section ref="salesChartRef" class="sales-chart"></section>
        </el-card>
      </el-col>

      <!-- 最火爆卖品表格 -->
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