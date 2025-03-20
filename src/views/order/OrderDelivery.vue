<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
// 使用专门的派送系统API
import { dispatchOrder, getPendingOrders } from '@/api/delivery';
import type { DeliveryOrder, DispatchRequest } from '@/types/interfaces';

// 添加从Order定义派生的类型，来匹配getOrders返回的订单数据
interface OrderData {
  id: number;
  order_no: string;
  customer_phone: string;
  total_amount: number;
  adjusted_amount?: number;
  order_remark?: string;
  order_create_time: string;
  order_update_time?: string;
  delivery_status?: number;
  delivery_address?: string;
  dispatch_status?: number; // 新增字段，与orderInfo表中的dispatch_status对应
  [key: string]: any; // 添加索引签名以允许其他可能的字段
}

// 扩展DeliveryOrder接口
interface EnhancedDeliveryOrder extends DeliveryOrder {
  deliveryStatus: number;
}

// 获取用户信息
const userStore = useUserStore();
const operatorId = userStore.getUserInfo()?.id;

// 表格数据
const tableData = ref<EnhancedDeliveryOrder[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const size = ref(10);

// 搜索条件
const searchDateRange = ref<[Date, Date] | []>([]);
const searchPhone = ref('');

// 日期选择器选项
const pickerOptions = {
  shortcuts: [
    {
      text: '最近一周',
      onClick(picker: any) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        picker.$emit('pick', [start, end]);
      },
    },
    {
      text: '最近一个月',
      onClick(picker: any) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        picker.$emit('pick', [start, end]);
      },
    },
    {
      text: '最近三个月',
      onClick(picker: any) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
        picker.$emit('pick', [start, end]);
      },
    },
  ],
};

// 派送对话框
const dispatchDialogVisible = ref(false);
const currentOrder = ref<EnhancedDeliveryOrder | null>(null);
const dispatchForm = ref<DispatchRequest>({
  orderId: 0,
  deliveryAddress: '',
  deliveryRemark: '',
  deliveryWeight: 0,
  deliveryFee: 0,
  operatorId: operatorId || 0
});

// 配送详情对话框
const deliveryDetailsVisible = ref(false);

// 系统状态
const isDeliverySystemReady = ref(false);
const systemErrorMessage = ref('');

// 派送状态映射
const deliveryStatusMap = {
  0: { text: '未派送', type: 'info' },
  1: { text: '待接单', type: 'warning' },
  2: { text: '配送中', type: 'primary' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已取消', type: 'danger' }
};

// 获取派送状态文本
const getDeliveryStatusText = (status: number | undefined) => {
  if (status === undefined) return '未派送';
  return deliveryStatusMap[status as keyof typeof deliveryStatusMap]?.text || '未知状态';
};

// 获取派送状态类型（用于标签颜色）
const getDeliveryStatusType = (status: number | undefined) => {
  if (status === undefined) return 'info';
  return deliveryStatusMap[status as keyof typeof deliveryStatusMap]?.type || '';
};

// 显示配送详情
const showDeliveryDetails = (row: EnhancedDeliveryOrder) => {
  currentOrder.value = row;
  deliveryDetailsVisible.value = true;
};

// 格式化日期
const formatDate = (date: Date, isEndDate = false) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (isEndDate) {
    return `${year}-${month}-${day} 23:59:59`;
  }
  return `${year}-${month}-${day} 00:00:00`;
};

// 加载待派送订单列表
const loadPendingOrders = async () => {
  loading.value = true;
  systemErrorMessage.value = '';
  
  try {
    // 构建查询参数
    const params: any = {
      page: page.value,
      size: size.value
    };

    // 添加手机号筛选
    if (searchPhone.value.trim()) {
      params.customerPhone = searchPhone.value.trim();
    }

    // 添加日期筛选
    if (searchDateRange.value && searchDateRange.value.length === 2) {
      const [startDate, endDate] = searchDateRange.value;
      if (startDate && endDate) {
        params.startTime = formatDate(startDate);
        params.endTime = formatDate(endDate, true);
      }
    }

    // 使用派送系统的API
    const response = await getPendingOrders(params);
    
    if (response.data && response.data.code === 200) {
      // 设置派送系统就绪标志
      isDeliverySystemReady.value = true;
      
      // 解析返回的派送订单数据
      const orders = response.data.data.items || [];
      
      tableData.value = orders.map((order: any) => ({
        id: order.id,
        orderId: order.order_id,
        orderNo: order.order_no,
        customerPhone: order.customer_phone,
        totalAmount: order.total_amount,
        orderCreateTime: order.create_time,
        orderRemark: order.order_remark,
        deliveryAddress: order.delivery_address || '',
        deliveryStatus: order.delivery_status,
        deliveryWeight: order.delivery_weight,
        deliveryFee: order.delivery_fee
      }));
      total.value = response.data.data.total || 0;
    } else {
      ElMessage.error(response.data?.message || '获取派送订单列表失败');
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取派送订单列表失败:', error);
    isDeliverySystemReady.value = false;
    systemErrorMessage.value = '派送系统未就绪，请稍后再试';
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 重置搜索条件
const resetSearch = () => {
  searchDateRange.value = [];
  searchPhone.value = '';
  page.value = 1;
  loadPendingOrders();
};

// 处理页码变化
const handlePageChange = (currentPage: number) => {
  page.value = currentPage;
  loadPendingOrders();
};

// 处理每页显示数量变化
const handleSizeChange = (pageSize: number) => {
  size.value = pageSize;
  page.value = 1;
  loadPendingOrders();
};

// 打开派送对话框
const handleDispatch = (row: EnhancedDeliveryOrder) => {
  currentOrder.value = row;
  dispatchForm.value = {
    orderId: row.id || 0,
    deliveryAddress: row.deliveryAddress || '',
    deliveryRemark: '',
    deliveryWeight: 0,
    deliveryFee: 0,
    operatorId: operatorId || 0
  };
  dispatchDialogVisible.value = true;
};

// 提交派送请求
const submitDispatch = async () => {
  if (!dispatchForm.value.deliveryAddress) {
    ElMessage.error('配送地址不能为空');
    return;
  }

  if (dispatchForm.value.deliveryWeight <= 0) {
    ElMessage.error('货物吨数必须大于0');
    return;
  }

  if (dispatchForm.value.deliveryFee < 0) {
    ElMessage.error('配送费不能为负数');
    return;
  }

  try {
    // 使用 ElMessageBox 确认派送操作
    const confirmResult = await ElMessageBox.confirm('确认派送该订单?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // 用户确认后继续
    try {
      // 向派送系统发送派送请求
      const response = await dispatchOrder(dispatchForm.value);
      
      if (response.data && response.data.code === 200) {
        ElMessage.success('订单派送成功');
        dispatchDialogVisible.value = false;
        loadPendingOrders(); // 重新加载列表
      } else {
        throw new Error(response.data?.message || '派送订单失败');
      }
    } catch (error) {
      console.error('派送订单时出错:', error);
      ElMessage.error('派送订单失败，请稍后重试');
    }
  } catch (error) {
    // 用户取消确认
    ElMessage.info('已取消派送操作');
  }
};

// 格式化日期时间
const formatDateTime = (dateTimeStr: string | undefined) => {
  if (!dateTimeStr) return '-';
  return new Date(dateTimeStr).toLocaleString();
};

onMounted(() => {
  loadPendingOrders();
});
</script>

<template>
  <div class="order-delivery-container">
    <h1>订单派送管理</h1>
    <hr>
    
    <!-- 搜索区域 -->
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
            @change="loadPendingOrders"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="按手机号筛选">
          <el-input
            v-model="searchPhone"
            placeholder="输入客户手机号"
            clearable
            @input="loadPendingOrders"
          />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button @click="resetSearch">清除筛选</el-button>
      </el-col>
    </el-row>
    
    <!-- 系统未就绪提示 -->
    <el-alert
      v-if="!isDeliverySystemReady && systemErrorMessage"
      :title="systemErrorMessage"
      type="warning"
      :closable="false"
      show-icon
      class="system-alert"
    >
      <template #default>
        <p>派送系统后端服务未就绪，请检查连接或联系系统管理员。</p>
        <p>目前只能通过订单管理页面的派送按钮发起派送请求，暂时无法在本页面查看派送状态。</p>
      </template>
    </el-alert>
    
    <!-- 订单列表 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      v-loading="loading"
      border
      stripe
      highlight-current-row
      header-cell-class-name="table-header"
    >
      <el-table-column prop="orderId" label="订单ID" width="80" align="center" />
      <el-table-column prop="orderNo" label="订单编号" width="180" align="center" />
      <el-table-column prop="customerPhone" label="客户手机号" width="150" align="center" />
      <el-table-column prop="totalAmount" label="订单金额" width="120" align="center">
        <template #default="{ row }">
          {{ row.totalAmount ? row.totalAmount.toFixed(2) + ' 元' : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="deliveryFee" label="配送费" width="100" align="center">
        <template #default="{ row }">
          {{ row.deliveryFee ? row.deliveryFee.toFixed(2) + ' 元' : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="deliveryWeight" label="货物吨数" width="100" align="center">
        <template #default="{ row }">
          {{ row.deliveryWeight ? row.deliveryWeight.toFixed(1) + ' 吨' : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="deliveryStatus" label="派送状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getDeliveryStatusType(row.deliveryStatus)">
            {{ getDeliveryStatusText(row.deliveryStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderCreateTime" label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.orderCreateTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="deliveryAddress" label="配送地址" min-width="200" :show-overflow-tooltip="true" />
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.deliveryStatus === 0"
            type="primary"
            size="small"
            @click="handleDispatch(row)"
          >派送</el-button>
          <el-button
            v-else-if="row.deliveryStatus === 1 || row.deliveryStatus === 2"
            type="warning"
            size="small"
            @click="showDeliveryDetails(row)"
          >详情</el-button>
          <el-button
            v-else
            type="info"
            size="small"
            @click="showDeliveryDetails(row)"
          >查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 空数据提示 -->
    <div v-if="!loading && tableData.length === 0 && !systemErrorMessage" class="empty-data">
      <el-empty description="暂无派送订单数据" />
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container" v-if="tableData.length > 0">
      <el-pagination
        :current-page="page"
        :page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
    
    <!-- 派送对话框 -->
    <el-dialog
      v-model="dispatchDialogVisible"
      title="派送订单"
      width="50%"
      destroy-on-close
    >
      <div v-if="currentOrder" class="order-info-summary">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户手机号">{{ currentOrder.customerPhone }}</el-descriptions-item>
          <el-descriptions-item label="订单总金额">
            {{ currentOrder.totalAmount ? currentOrder.totalAmount.toFixed(2) + ' 元' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentOrder.orderCreateTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <!-- 派送表单 -->
      <el-form :model="dispatchForm" label-width="120px">
        <el-form-item label="配送地址" required>
          <el-input
            v-model="dispatchForm.deliveryAddress"
            placeholder="请输入配送地址"
          />
        </el-form-item>
        <el-form-item label="配送备注">
          <el-input
            v-model="dispatchForm.deliveryRemark"
            type="textarea"
            placeholder="请输入配送备注"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="货物吨数" required>
          <el-input-number
            v-model="dispatchForm.deliveryWeight"
            :min="0.1"
            :step="0.1"
            :precision="1"
          />
        </el-form-item>
        <el-form-item label="配送费" required>
          <el-input-number
            v-model="dispatchForm.deliveryFee"
            :min="0"
            :step="1"
            :precision="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dispatchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDispatch">确认派送</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 配送详情对话框 -->
    <el-dialog
      v-model="deliveryDetailsVisible"
      title="配送详情"
      width="50%"
      destroy-on-close
    >
      <div v-if="currentOrder" class="delivery-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户手机号">{{ currentOrder.customerPhone }}</el-descriptions-item>
          <el-descriptions-item label="订单总金额">
            {{ currentOrder.totalAmount ? currentOrder.totalAmount.toFixed(2) + ' 元' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="配送地址">{{ currentOrder.deliveryAddress || '-' }}</el-descriptions-item>
          <el-descriptions-item label="派送状态">
            <el-tag :type="getDeliveryStatusType(currentOrder.deliveryStatus)">
              {{ getDeliveryStatusText(currentOrder.deliveryStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentOrder.orderCreateTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deliveryDetailsVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.order-delivery-container {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.order-info-summary {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

:deep(.table-header) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

.system-alert {
  margin-bottom: 20px;
}

.empty-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 