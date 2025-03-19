<template>
    <div class="delivery-dispatch-container">
      <h1>订单派送</h1>
      <hr>
      
      <el-card class="filter-container">
        <el-form :inline="true">
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
              <el-form-item label="派送状态">
                <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
                  <el-option label="待派单" :value="1"></el-option>
                  <el-option label="待接单" :value="2"></el-option>
                  <el-option label="配送中" :value="3"></el-option>
                  <el-option label="已完成" :value="4"></el-option>
                  <el-option label="已取消" :value="5"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="loadOrders">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
        </el-form>
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
          <el-table-column prop="deliveryAddress" label="配送地址" min-width="200" />
          <el-table-column prop="orderRemark" label="订单备注" min-width="150" />
          <el-table-column prop="deliveryStatus" label="配送状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.deliveryStatus" :type="getStatusType(row.deliveryStatus)">
                {{ getStatusText(row.deliveryStatus) }}
              </el-tag>
              <span v-else>待派送</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  v-if="!scope.row.deliveryStatus || scope.row.deliveryStatus === 1"
                  type="primary" 
                  size="small" 
                  @click="handleDispatch(scope.row)"
                >派单</el-button>
                
                <el-button 
                  v-if="scope.row.deliveryStatus === 2 || scope.row.deliveryStatus === 3"
                  type="danger" 
                  size="small" 
                  @click="handleCancel(scope.row)"
                >取消派送</el-button>
                
                <el-button 
                  v-if="scope.row.deliveryStatus === 2"
                  type="success" 
                  size="small" 
                  @click="updateDeliveryStatus(scope.row.id, 3)"
                >确认配送中</el-button>
                
                <el-button 
                  v-if="scope.row.deliveryStatus === 3"
                  type="success" 
                  size="small" 
                  @click="updateDeliveryStatus(scope.row.id, 4)"
                >完成配送</el-button>
                
                <el-button 
                  v-if="scope.row.deliveryStatus === 4 || scope.row.deliveryStatus === 5"
                  type="info" 
                  size="small" 
                  disabled
                >{{ scope.row.deliveryStatus === 4 ? '已完成' : '已取消' }}</el-button>
              </div>
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
          <el-form-item label="配送重量(吨):">
            <el-input-number v-model="deliveryWeight" :min="0.1" :precision="2" :step="0.5" placeholder="请输入配送重量"></el-input-number>
          </el-form-item>
          <el-form-item label="配送地址:">
            <el-input v-model="deliveryAddress" placeholder="请输入详细配送地址"></el-input>
          </el-form-item>
          <el-form-item label="配送费用:">
            <el-input-number v-model="deliveryFee" :min="0" :precision="2" :step="5" placeholder="请输入配送费用"></el-input-number>
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
  import { ref, reactive, onMounted, computed, watch } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { getPendingOrders, dispatchOrder, getDeliveryStatus, updateDeliveryStatusApi, cancelDelivery } from '@/api/delivery';
  import { useUserStore } from '@/stores/user';
  import { useRoute } from 'vue-router';
  import type { DeliveryQueryParams, DeliveryOrder, DispatchRequest } from '@/types/interfaces';
  
  const userStore = useUserStore();
  const route = useRoute();
  const loading = ref(false);
  const dispatchLoading = ref(false);
  const dialogVisible = ref(false);
  const orderList = ref<DeliveryOrder[]>([]);
  const total = ref(0);
  const currentOrder = ref<DeliveryOrder | null>(null);
  const deliveryAddress = ref('');
  const deliveryRemark = ref('');
  const deliveryWeight = ref<number | null>(null);
  const deliveryFee = ref<number | null>(null);
  
  const queryForm = reactive<DeliveryQueryParams>({
    orderNo: route.query.orderNo as string || '',
    customerPhone: route.query.customerPhone as string || '',
    status: undefined,
    page: 1,
    size: 10
  });
  
  const operatorId = computed(() => userStore.getUserInfo()?.id || 0);
  
  const statusMap: Record<number, { text: string; type: string }> = {
    1: { text: '待派单', type: 'info' },
    2: { text: '待接单', type: 'warning' },
    3: { text: '配送中', type: 'primary' },
    4: { text: '已完成', type: 'success' },
    5: { text: '已取消', type: 'danger' }
  };
  
  const getStatusText = (status: number) => statusMap[status]?.text || '未知状态';
  const getStatusType = (status: number) => statusMap[status]?.type || '';
  
  watch(() => route.query, (query) => {
    if (query.orderNo) {
      queryForm.orderNo = query.orderNo as string;
    }
    if (query.customerPhone) {
      queryForm.customerPhone = query.customerPhone as string;
    }
  }, { immediate: true });
  
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
          deliveryAddress: item.delivery_address || '',
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
    deliveryRemark.value = '';
    deliveryWeight.value = null;
    deliveryFee.value = null;
    dialogVisible.value = true;
  };
  
  const confirmDispatch = async () => {
    if (!deliveryAddress.value) {
      ElMessage.warning('请输入配送地址');
      return;
    }
  
    if (!deliveryWeight.value || deliveryWeight.value <= 0) {
      ElMessage.warning('请输入有效的配送重量');
      return;
    }
  
    if (deliveryFee.value === null) {
      ElMessage.warning('请输入配送费用');
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
        deliveryWeight: deliveryWeight.value,
        deliveryFee: deliveryFee.value,
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
  
  const updateDeliveryStatus = async (id: number, status: number) => {
    try {
      const response = await updateDeliveryStatusApi(id, status, operatorId.value);
      
      if (response.status === 200) {
        ElMessage.success(`订单状态已更新为${getStatusText(status)}`);
        await loadOrders();
      } else {
        throw new Error(response.data?.message || '状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      ElMessage.error('状态更新失败，请稍后重试');
    }
  };
  
  const handleCancel = (row: DeliveryOrder) => {
    if (!row.id) {
      ElMessage.error('订单ID不存在');
      return;
    }
    
    ElMessageBox.confirm(
      '确定要取消这个派送订单吗？',
      '取消确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          const response = await cancelDelivery(row.id as number, operatorId.value);
          
          if (response.status === 200) {
            ElMessage.success('派送订单已取消');
            await loadOrders();
          } else {
            throw new Error(response.data?.message || '取消失败');
          }
        } catch (error) {
          console.error('取消派送失败:', error);
          ElMessage.error('取消派送失败，请稍后重试');
        }
      })
      .catch(() => {
        // 用户取消操作
      });
  };
  
  const resetQuery = () => {
    queryForm.orderNo = '';
    queryForm.customerPhone = '';
    queryForm.status = undefined;
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
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .no-data {
    padding: 20px;
    text-align: center;
    color: #909399;
  }
  </style>