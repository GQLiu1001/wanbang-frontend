<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchTotalSalesAmount, fetchTodaySalesAmount, fetchSalesTrend, fetchTopProducts } from '@/api/sales';
import { useRoute } from 'vue-router';

// 获取当前路由
const route = useRoute();

// 数据定义
const salesData = ref<{ dates: string[]; salesValues: number[]; amounts: number[] }>({ dates: [], salesValues: [], amounts: [] });
const topProducts = ref<{ model_number: string; sales: number; }[]>([]);
const totalSalesAmount = ref<number>(0);
const todaySalesAmount = ref<number>(0);

// 引用图表和表格容器DOM元素
const salesChartRef = ref<HTMLElement | null>(null);
const productCardRef = ref<HTMLElement | null>(null);
const tableContainerRef = ref<HTMLElement | null>(null);
let salesChart: echarts.ECharts | null = null;

// 计算表格高度
const tableHeight = ref(300);

// 获取销售趋势数据
const fetchSalesData = async () => {
  try {
    // 根据API文档，需要传入year, month, length参数
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const length = 6; // 获取6个月的数据

    const response = await fetchSalesTrend(year, month, length);
    if (response.data.code === 200) {
      // 根据API文档中的响应格式解析数据
      const apiData = response.data.data;
      // 确保数据按照日期正序排列
      apiData.sort((a: any, b: any) => new Date(a.dates).getTime() - new Date(b.dates).getTime());
      const dates = apiData.map((item: any) => item.dates);
      const salesValues = apiData.map((item: any) => item.salesValues);
      const amounts = apiData.map((item: any) => item.amounts);

      salesData.value = {
        dates,
        salesValues,
        amounts
      };
    } else {
      throw new Error(response.data.message || '获取销售趋势数据失败');
    }
  } catch (error) {
    console.error('获取销售趋势数据失败：', error);
    ElMessage.warning('无法获取销量趋势数据，已显示默认数据');
    // 修改默认数据，按照正确的时间顺序
    salesData.value = {
      dates: ['2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03'],
      salesValues: [100, 90, 120, 133, 566, 600],
      amounts: [9000, 7500, 23333, 12500, 123333, 150000],
    };
  }
};

// 获取最火爆卖品数据
const fetchTopProductsData = async () => {
  try {
    const response = await fetchTopProducts();
    if (response.data.code === 200) {
      // API返回的直接是一个数组
      topProducts.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取最火爆卖品数据失败');
    }
  } catch (error) {
    console.error('获取最火爆卖品数据失败：', error);
    ElMessage.warning('无法获取最火爆卖品数据，已显示默认数据');
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

  if (salesChart) {
    salesChart.dispose();
  }

  salesChart = echarts.init(salesChartRef.value);
  const option = {
    title: { text: '销售趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['销量', '销售金额'], top: '5%' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: salesData.value.dates,
      axisLabel: {
        interval: 0,
        rotate: salesData.value.dates.length > 5 ? 30 : 0
      }
    },
    yAxis: [
      { type: 'value', name: '销量', position: 'left' },
      { type: 'value', name: '销售金额（元）', position: 'right', axisLabel: { formatter: '{value}' } }
    ],
    series: [
      {
        name: '销量',
        type: 'line',
        data: salesData.value.salesValues,
        smooth: true,
        yAxisIndex: 0,
        lineStyle: { color: '#409EFF' },
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '销售金额',
        type: 'line',
        data: salesData.value.amounts,
        smooth: true,
        yAxisIndex: 1,
        lineStyle: { color: '#67C23A' },
        itemStyle: { color: '#67C23A' }
      }
    ]
  };
  salesChart.setOption(option);
};

// 更新表格高度
const updateTableHeight = () => {
  if (!productCardRef.value || !tableContainerRef.value) return;

  const cardPadding = 20;
  const titleHeight = 40;

  const cardHeight = productCardRef.value.clientHeight;
  const availableHeight = cardHeight - titleHeight - cardPadding;

  tableHeight.value = Math.max(availableHeight, 200);
  tableContainerRef.value.style.height = `${tableHeight.value}px`;
};

// 处理窗口大小变化和缩放
const handleResize = () => {
  setTimeout(() => {
    if (salesChart) {
      salesChart.resize();
    }
    updateTableHeight();
  }, 200);
};

// 监听路由变化
watch(
    () => route.path,
    (newPath) => {
      if (newPath.includes(route.name as string)) {
        nextTick(() => {
          handleResize();
        });
      }
    }
);

// 加载所有数据
const loadAllData = async () => {
  try {
    const totalResponse = await fetchTotalSalesAmount();
    if (totalResponse.data.code === 200) {
      // 根据API文档的响应结构
      totalSalesAmount.value = totalResponse.data.data.total_sale_amount;
    } else {
      throw new Error(totalResponse.data.message || '获取总销售金额失败');
    }
  } catch (error) {
    console.error('获取总销售金额失败：', error);
    ElMessage.warning('无法获取总销售金额，已显示默认数据');
    totalSalesAmount.value = 150000;
  }

  try {
    const todayResponse = await fetchTodaySalesAmount();
    if (todayResponse.data.code === 200) {
      // 根据API文档的响应结构
      todaySalesAmount.value = todayResponse.data.data.today_sale_amount;
    } else {
      throw new Error(todayResponse.data.message || '获取今日销售金额失败');
    }
  } catch (error) {
    console.error('获取今日销售金额失败：', error);
    ElMessage.warning('无法获取今日销售金额，已显示默认数据');
    todaySalesAmount.value = 5000;
  }

  await fetchSalesData();
  await fetchTopProductsData();

  await nextTick();
  initSalesChart();
  updateTableHeight();
};

onMounted(async () => {
  await loadAllData();

  window.addEventListener('resize', handleResize);

  const observer = new MutationObserver(handleResize);
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
  });

  (window as any).__resizeObserver = observer;
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if ((window as any).__resizeObserver) {
    (window as any).__resizeObserver.disconnect();
    (window as any).__resizeObserver = null;
  }

  if (salesChart) {
    salesChart.dispose();
    salesChart = null;
  }
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
      <el-col :span="18">
        <el-card shadow="hover" class="rounded-card chart-card">
          <section ref="salesChartRef" class="sales-chart"></section>
        </el-card>
      </el-col>

      <!-- 最火爆卖品表格 -->
      <el-col :span="6">
        <el-card shadow="hover" ref="productCardRef" class="rounded-card product-card">
          <div class="card-header">
            <h3>最火爆卖品</h3>
          </div>
          <div ref="tableContainerRef" class="table-container">
            <el-table
                :data="topProducts"
                border
                style="width: 100%"
                size="small"
                :height="tableHeight"
                :header-cell-style="{
                background: '#f5f7fa',
                color: '#606266',
                fontWeight: 'bold'
              }">
              <el-table-column
                  prop="model_number"
                  label="产品型号"
                  min-width="70"
                  show-overflow-tooltip />
              <el-table-column
                  prop="sales"
                  label="销量"
                  min-width="50"
                  width="70"
                  align="center" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>


<style scoped>
/* 样式保持不变 */
.welcome-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.stats-section {
  margin-top: 0;
  margin-bottom: 20px;
}

.charts-section {
  display: flex;
  height: calc(100% - 150px);
  min-height: 500px;
}

.el-row {
  width: 100%;
}

.chart-card,
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.card-header {
  flex: 0 0 auto;
  padding-bottom: 10px;
}

.table-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 200px;
}

.sales-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
  flex: 1;
}

h1 {
  text-align: center;
  color: #409EFF;
  margin-top: 0;
  margin-bottom: 15px;
}

h3 {
  text-align: center;
  margin: 0 0 10px 0;
}

/* 统计卡片样式 */
.stats-card {
  text-align: center;
  height: 100px;
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

/* 确保在小屏幕上表格不会太小 */
@media screen and (max-width: 1400px) {
  .charts-section {
    min-height: 450px;
  }
}

/* 适应不同缩放级别 */
@media screen and (min-resolution: 120dpi) {
  .table-container {
    overflow: auto;
  }

  .product-card {
    overflow: visible;
  }
}
</style>