<template>
    <div class="delivery-dispatch-container">
      <h1>订单派送</h1>
      <hr>
      
      <el-card class="filter-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="订单编号">
              <el-input v-model="queryForm.orderNo" placeholder="请输入订单编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户电话">
              <el-input v-model="queryForm.customerPhone" placeholder="请输入客户电话"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="loadOrders">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-col>
        </el-row>
      </el-card>
  
      <el-card class="order-list-container">
        <el-table :data="orderList" style="width: 100%" v-loading="loading" border>
          <el-table-column prop="orderNo" label="订单编号" width="180" />
          <el-table-column prop="customerPhone" label="客户电话" width="150" />
          <el-table-column prop="totalAmount" label="订单金额" width="120">
            <template #default="{ row }">
              {{ row.totalAmount ? `¥${row.totalAmount.toFixed(2)}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="orderCreateTime" label="创建时间" width="180">
            <template #default="{ row }">
              {{ row.orderCreateTime ? new Date(row.orderCreateTime).toLocaleString() : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="orderRemark" label="订单备注" min-width="200" />
          <el-table-column prop="deliveryStatus" label="配送状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.deliveryStatus" :type="getStatusType(row.deliveryStatus)">
                {{ getStatusText(row.deliveryStatus) }}
              </el-tag>
              <span v-else>待派送</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                v-if="!scope.row.deliveryStatus || scope.row.deliveryStatus === 1"
                type="primary" 
                size="small" 
                @click="handleDispatch(scope.row)"
              >派单</el-button>
              <el-button v-else type="info" size="small" disabled>已派送</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-if="total > 0"
            :current-page="queryForm.page"
            :page-size="queryForm.size"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
          <div v-else class="no-data">暂无订单数据</div>
        </div>
      </el-card>
  
      <!-- 派单对话框 -->
      <el-dialog v-model="dialogVisible" title="确认派单" width="500px">
        <el-form label-width="100px">
          <el-form-item label="订单编号:">
            <span>{{ currentOrder?.orderNo }}</span>
          </el-form-item>
          <el-form-item label="客户电话:">
            <span>{{ currentOrder?.customerPhone }}</span>
          </el-form-item>
          <el-form-item label="配送地址:">
            <el-input v-model="deliveryAddress" placeholder="请输入详细配送地址"></el-input>
          </el-form-item>
          <el-form-item label="配送备注:">
            <el-input v-model="deliveryRemark" type="textarea" placeholder="请输入配送备注信息"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmDispatch" :loading="dispatchLoading">确定派单</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { getPendingOrders, dispatchOrder } from '@/api/delivery';
  import { useUserStore } from '@/stores/user';
  import type { DeliveryQueryParams, DeliveryOrder, DispatchRequest } from '@/types/interfaces';
  
  const userStore = useUserStore();
  const loading = ref(false);
  const dispatchLoading = ref(false);
  const dialogVisible = ref(false);
  const orderList = ref<DeliveryOrder[]>([]);
  const total = ref(0);
  const currentOrder = ref<DeliveryOrder | null>(null);
  const deliveryAddress = ref('');
  const deliveryRemark = ref('');
  
  const queryForm = reactive<DeliveryQueryParams>({
    orderNo: '',
    customerPhone: '',
    page: 1,
    size: 10
  });
  
  const operatorId = computed(() => userStore.getUserInfo()?.id || 0);
  
  const statusMap = {
    1: { text: '待派送', type: 'info' },
    2: { text: '待接单', type: 'warning' },
    3: { text: '配送中', type: 'primary' },
    4: { text: '已完成', type: 'success' },
    5: { text: '已取消', type: 'danger' }
  };
  
  const getStatusText = (status: number) => statusMap[status]?.text || '未知状态';
  const getStatusType = (status: number) => statusMap[status]?.type || '';
  
  const loadOrders = async () => {
    loading.value = true;
    try {
      const response = await getPendingOrders(queryForm);
      const data = response.data;
      if (data.code === 200 && data.data) {
        orderList.value = data.data.items.map((item: any) => ({
          id: item.id,
          orderNo: item.order_no,
          orderId: item.id,
          customerPhone: item.customer_phone,
          totalAmount: item.total_amount,
          orderCreateTime: item.order_create_time,
          orderRemark: item.order_remark,
          deliveryStatus: item.delivery_status || 1,
        }));
        total.value = data.data.total || 0;
      } else {
        orderList.value = [];
        total.value = 0;
        ElMessage.warning(data.message || '获取订单列表失败');
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      ElMessage.error('获取订单列表失败，请稍后重试');
      orderList.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };
  
  const handleDispatch = (row: DeliveryOrder) => {
    currentOrder.value = row;
    deliveryAddress.value = '';
    deliveryRemark.value = row.orderRemark || '';
    dialogVisible.value = true;
  };
  
  const confirmDispatch = async () => {
    if (!deliveryAddress.value) {
      ElMessage.warning('请输入配送地址');
      return;
    }
  
    if (!currentOrder.value || !currentOrder.value.id) {
      ElMessage.error('订单信息不完整');
      return;
    }
  
    dispatchLoading.value = true;
    try {
      const dispatchData: DispatchRequest = {
        orderId: currentOrder.value.id,
        deliveryAddress: deliveryAddress.value,
        deliveryRemark: deliveryRemark.value,
        operatorId: operatorId.value
      };
  
      const response = await dispatchOrder(dispatchData);
      
      if (response.status === 200 || response.status === 201) {
        ElMessage.success('派单成功，司机将收到派送通知');
        dialogVisible.value = false;
        await loadOrders();
      } else {
        throw new Error(response.data?.message || '派单失败');
      }
    } catch (error) {
      console.error('派单失败:', error);
      ElMessage.error('派单失败，请稍后重试');
    } finally {
      dispatchLoading.value = false;
    }
  };
  
  const resetQuery = () => {
    queryForm.orderNo = '';
    queryForm.customerPhone = '';
    queryForm.page = 1;
    loadOrders();
  };
  
  const handleSizeChange = (val: number) => {
    queryForm.size = val;
    loadOrders();
  };
  
  const handleCurrentChange = (val: number) => {
    queryForm.page = val;
    loadOrders();
  };
  
  onMounted(() => {
    loadOrders();
  });
  </script>
  
  <style scoped>
  .delivery-dispatch-container {
    padding: 20px;
  }
  .filter-container {
    margin-bottom: 20px;
  }
  .order-list-container {
    margin-bottom: 20px;
  }
  .pagination-container {
    margin-top: 20px;
    text-align: center;
  }
  .no-data {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  </style>