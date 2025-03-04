<!--售后表单-->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrderDetail } from '@/api/order';
import { createAftersale, getOrderAftersaleLogs, updateAftersaleStatus } from '@/api/aftersales';
import { useUserStore } from '@/stores/user';

// 订单项类型
interface OrderItem {
  id: number;
  order_id?: number;
  item_id: number;
  model_number: string;
  specification?: string;
  manufacturer?: string;
  quantity: number;
  price_per_piece: number;
  subtotal: number;
  adjusted_quantity?: number | null;
}

// 订单类型
interface Order {
  id: number;
  order_no: string;
  customer_phone: string;
  operator_id: number;
  operator_name?: string;
  total_amount: number;
  adjusted_amount?: number | null;
  order_remark?: string;
  order_create_time: string;
  order_update_time: string;
  aftersale_status?: number | null;
  items: OrderItem[];  // 订单包含的多个商品项
}

// 售后项目类型
interface AftersaleItem {
  order_item_id: number;
  quantity_change: number;
  amount_change: number;
}

// 售后记录类型 - 与API文档一致
interface Aftersale {
  id?: number;
  order_id: number;
  aftersale_type: number | null;
  aftersale_status: number | null;
  items: AftersaleItem[];
  resolution_result: string;
  aftersale_operator: number;
  create_time?: string;
}

// 路由相关
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 加载状态
const loading = ref(false);
const noOrderFound = ref(false);

// 当前售后订单
const order = ref<Order | null>(null);

// 售后表单
const aftersaleForm = ref<Aftersale>({
  order_id: 0,
  aftersale_type: null,
  aftersale_status: 1, // 默认为"新建"状态
  resolution_result: '',
  aftersale_operator: userStore.getUserInfo()?.id || 0,
  items: []
});

// 售后项目
const aftersaleItems = ref<{
  id: number;
  model_number: string;
  checked: boolean;
  quantity: number;
  currentQuantity: number;
  quantity_change: number;
  price_per_piece: number;
  amount_change: number;
}[]>([]);

// 历史售后记录
const aftersaleLogs = ref<Aftersale[]>([]);
const aftersaleLogsLoading = ref(false);

// 获取订单详情
const fetchOrderDetail = async (orderId: number) => {
  loading.value = true;
  noOrderFound.value = false;

  try {
    const response = await getOrderDetail(orderId);

    if (response.data.code === 200) {
      order.value = response.data.data;

      // 初始化售后表单
      aftersaleForm.value = {
        order_id: orderId,
        aftersale_type: null,
        aftersale_status: 1, // 默认为"新建"状态
        resolution_result: '',
        aftersale_operator: userStore.getUserInfo()?.id || 0,
        items: []
      };

      // 初始化售后项目
      aftersaleItems.value = order.value.items.map(item => ({
        id: item.id,
        model_number: item.model_number,
        checked: false,
        quantity: item.quantity,
        currentQuantity: item.adjusted_quantity !== null ? item.adjusted_quantity : item.quantity,
        quantity_change: 0,
        price_per_piece: item.price_per_piece,
        amount_change: 0
      }));

      // 获取历史售后记录
      await fetchAftersaleLogs(orderId);
    } else {
      ElMessage.error(response.data.message || '获取订单详情失败');
      noOrderFound.value = true;
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
    noOrderFound.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取售后记录
const fetchAftersaleLogs = async (orderId: number) => {
  aftersaleLogsLoading.value = true;
  try {
    const response = await getOrderAftersaleLogs(orderId);
    if (response.data.code === 200) {
      aftersaleLogs.value = response.data.data || [];
      console.log('售后记录:', aftersaleLogs.value);
    } else {
      console.error('获取售后记录失败:', response.data.message);
      aftersaleLogs.value = [];
    }
  } catch (error) {
    console.error('获取售后记录失败:', error);
    aftersaleLogs.value = [];
  } finally {
    aftersaleLogsLoading.value = false;
  }
};

// 切换售后类型
const handleAftersaleTypeChange = () => {
  // 重置所有项目的数量变化和金额变化
  aftersaleItems.value.forEach(item => {
    item.checked = false;
    item.quantity_change = 0;
    item.amount_change = 0;
  });
};

// 处理售后项目选择
const handleItemCheckedChange = (index: number) => {
  const item = aftersaleItems.value[index];
  if (!item.checked) {
    // 如果取消选中，重置数量变化和金额变化
    item.quantity_change = 0;
    item.amount_change = 0;
  }
};

// 更新售后项目的金额变化
const updateAmountChange = (index: number) => {
  const item = aftersaleItems.value[index];
  if (item.checked) {
    item.amount_change = Number((item.quantity_change * item.price_per_piece).toFixed(2));
  }
};

// 计算总的金额变化
const totalAmountChange = computed(() => {
  return aftersaleItems.value
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.amount_change, 0);
});

// 提交售后申请
const saveAftersale = async () => {
  if (!aftersaleForm.value.aftersale_type) {
    ElMessage.error('请选择售后类型');
    return;
  }

  if (!aftersaleForm.value.aftersale_operator) {
    ElMessage.error('请输入售后处理人ID');
    return;
  }

  // 检查是否有选中的项目
  const selectedItems = aftersaleItems.value.filter(item => item.checked);
  if (selectedItems.length === 0) {
    ElMessage.error('请至少选择一个商品项');
    return;
  }

  // 验证每个选中项目的数量变化
  for (const item of selectedItems) {
    if (item.quantity_change === 0) {
      ElMessage.error(`${item.model_number} 的数量变化不能为0`);
      return;
    }

    // 检查数量变化的正负与售后类型是否匹配
    if (aftersaleForm.value.aftersale_type === 1 && item.quantity_change > 0) {
      ElMessage.error(`买多退货退款类型下，${item.model_number} 的数量变化应为负数`);
      return;
    }

    if (aftersaleForm.value.aftersale_type === 2 && item.quantity_change < 0) {
      ElMessage.error(`买少补货补款类型下，${item.model_number} 的数量变化应为正数`);
      return;
    }
  }

  // 构建售后项目数据
  const aftersaleItemsData: AftersaleItem[] = selectedItems.map(item => ({
    order_item_id: item.id,
    quantity_change: item.quantity_change,
    amount_change: item.amount_change
  }));

  // 构建完整的售后数据
  const aftersaleData = {
    order_id: aftersaleForm.value.order_id,
    aftersale_type: aftersaleForm.value.aftersale_type,
    aftersale_status: aftersaleForm.value.aftersale_status,
    resolution_result: aftersaleForm.value.resolution_result,
    aftersale_operator: aftersaleForm.value.aftersale_operator,
    items: aftersaleItemsData
  };

  try {
    loading.value = true;
    const response = await createAftersale(aftersaleData);

    if (response.data.code === 200 || response.data.code === 201) {
      ElMessage.success('售后申请提交成功');

      // 重新获取订单详情以更新状态
      await fetchOrderDetail(aftersaleForm.value.order_id);

      // 重置表单
      aftersaleForm.value.aftersale_type = null;
      aftersaleForm.value.resolution_result = '';
      aftersaleItems.value.forEach(item => {
        item.checked = false;
        item.quantity_change = 0;
        item.amount_change = 0;
      });
    } else {
      ElMessage.error(response.data.message || '售后申请提交失败');
    }
  } catch (error) {
    console.error('售后申请提交失败:', error);
    ElMessage.error('售后申请提交失败');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'order-list' });
};

// 售后类型和状态映射
const aftersaleTypeMap = {
  1: '买多退货退款',
  2: '买少补货补款',
};

const aftersaleStatusMap = {
  1: '新建',
  2: '已解决'
};

// 处理已解决操作
const handleMarkAsResolved = async (log: Aftersale) => {
  // 确认是否将售后记录标记为已解决
  ElMessageBox.confirm('确定要将此售后记录标记为已解决吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用API更新售后状态
      const response = await updateAftersaleStatus(log.id!, 2);

      if (response.data.code === 200) {
        ElMessage.success('售后记录已成功标记为已解决');
        // 重新获取订单详情以更新状态
        await fetchOrderDetail(log.order_id);
      } else {
        ElMessage.error(response.data.message || '更新售后状态失败');
      }
    } catch (error) {
      console.error('更新售后状态失败:', error);
      ElMessage.error('更新售后状态失败');
    }
  }).catch(() => {
    // 取消操作
  });
};

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    const orderId = parseInt(newId as string);
    if (!isNaN(orderId)) {
      fetchOrderDetail(orderId);
    }
  }
}, { immediate: true });

onMounted(() => {
  // 获取URL中的订单ID
  const orderId = parseInt(route.params.id as string);
  if (!isNaN(orderId)) {
    fetchOrderDetail(orderId);
  }
});
</script>

<template>
  <div class="aftersale-page">
    <div class="page-header">
      <h1>订单售后管理</h1>
      <el-button type="primary" @click="goBack">返回订单列表</el-button>
    </div>
    <hr>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-wrapper">
          <el-skeleton-item variant="p" style="width: 100%; height: 50px; margin-bottom: 20px;" />
          <el-skeleton-item variant="p" style="width: 100%; height: 100px;" />
          <el-skeleton-item variant="p" style="width: 100%; height: 300px; margin-top: 20px;" />
        </div>
      </template>

      <template #default>
        <div v-if="noOrderFound" class="no-order-found">
          <el-empty description="未找到订单信息">
            <el-button type="primary" @click="goBack">返回订单列表</el-button>
          </el-empty>
        </div>

        <div v-else-if="order" class="aftersale-container">
          <!-- 订单基本信息 -->
          <div class="aftersale-order-info">
            <div class="info-header">订单基本信息</div>
            <div class="info-content">
              <div class="info-row">
                <div class="info-item">
                  <span class="label">订单编号:</span>
                  <span class="value">{{ order.order_no }}</span>
                </div>
                <div class="info-item">
                  <span class="label">客户手机号:</span>
                  <span class="value">{{ order.customer_phone }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <span class="label">订单总金额:</span>
                  <span class="value">{{ order.total_amount.toFixed(2) }} 元</span>
                </div>
                <div class="info-item">
                  <span class="label">当前金额:</span>
                  <span class="value">{{ order.adjusted_amount ? order.adjusted_amount.toFixed(2) : order.total_amount.toFixed(2) }} 元</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <span class="label">售后状态:</span>
                  <span class="value">
                    <el-tag :type="order.aftersale_status ? (order.aftersale_status === 1 ? 'warning' : 'success') : 'info'">
                      {{ order.aftersale_status ? aftersaleStatusMap[order.aftersale_status as keyof typeof aftersaleStatusMap] : '无' }}
                    </el-tag>
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">创建时间:</span>
                  <span class="value">{{ order.order_create_time }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 售后基本信息 -->
          <div class="aftersale-basic-info">
            <div class="section-title">售后处理信息</div>
            <el-form :model="aftersaleForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="售后类型" required>
                    <el-select
                        v-model="aftersaleForm.aftersale_type"
                        placeholder="请选择售后类型"
                        @change="handleAftersaleTypeChange"
                    >
                      <el-option label="买多退货退款" :value="1" />
                      <el-option label="买少补货补款" :value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="售后状态" required>
                    <el-select
                        v-model="aftersaleForm.aftersale_status"
                        placeholder="请选择售后状态"
                        :disabled="true"
                    >
                      <el-option label="新建" :value="1" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="售后处理人ID" required>
                    <el-input
                        v-model.number="aftersaleForm.aftersale_operator"
                        placeholder="请输入处理人ID"
                        type="number"
                        :disabled="true"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="处理结果说明" required>
                    <el-input
                        v-model="aftersaleForm.resolution_result"
                        placeholder="请输入处理结果说明"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <!-- 售后商品选择 -->
          <div class="aftersale-items">
            <div class="section-title">选择需要售后的商品</div>

            <el-table :data="aftersaleItems" border style="width: 100%">
              <el-table-column type="selection" width="55">
                <template #default="{ row, $index }">
                  <el-checkbox
                      v-model="row.checked"
                      @change="handleItemCheckedChange($index)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="model_number" label="产品型号" width="120" />
              <el-table-column label="原始数量" width="90">
                <template #default="{ row }">
                  {{ row.quantity }}
                </template>
              </el-table-column>
              <el-table-column label="当前数量" width="90">
                <template #default="{ row }">
                  {{ row.currentQuantity }}
                </template>
              </el-table-column>
              <el-table-column label="数量变化" width="180">
                <template #default="{ row, $index }">
                  <el-input
                      v-model.number="row.quantity_change"
                      type="number"
                      placeholder="正数补货/负数退货"
                      :disabled="!row.checked"
                      @input="updateAmountChange($index)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="单价" width="90">
                <template #default="{ row }">
                  {{ row.price_per_piece.toFixed(2) }} 元
                </template>
              </el-table-column>
              <el-table-column label="金额变化" width="120">
                <template #default="{ row }">
                  <span :class="{'positive': row.amount_change > 0, 'negative': row.amount_change < 0}">
                    {{ row.amount_change.toFixed(2) }} 元
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="说明">
                <template #default="{ row }">
                  <span v-if="row.quantity_change > 0">补货 {{ row.quantity_change }} 件</span>
                  <span v-else-if="row.quantity_change < 0">退货 {{ -row.quantity_change }} 件</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>

            <div class="total-amount-change">
              <span class="label">总金额变化:</span>
              <span class="value" :class="{'positive': totalAmountChange > 0, 'negative': totalAmountChange < 0}">
                {{ totalAmountChange.toFixed(2) }} 元
              </span>
            </div>

            <div class="submit-section">
              <el-button type="primary" @click="saveAftersale">提交售后申请</el-button>
            </div>
          </div>

          <!-- 历史售后记录 -->
          <div class="aftersale-history" v-if="aftersaleLogs.length > 0">
            <div class="section-title">历史售后记录</div>

            <el-table :data="aftersaleLogs" v-loading="aftersaleLogsLoading" border style="width: 100%">
              <el-table-column prop="id" label="记录ID" width="80" />
              <el-table-column label="售后类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.aftersale_type === 1 ? 'danger' : 'success'">
                    {{ row.aftersale_type === 1 ? '退货退款' : '补货补款' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="售后状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.aftersale_status === 1 ? 'warning' : 'success'">
                    {{ row.aftersale_status === 1 ? '新建' : '已解决' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="处理结果" min-width="200">
                <template #default="{ row }">
                  {{ row.resolution_result }}
                </template>
              </el-table-column>
              <el-table-column label="处理人" width="100">
                <template #default="{ row }">
                  {{ row.aftersale_operator }}
                </template>
              </el-table-column>
              <el-table-column label="创建时间" width="160">
                <template #default="{ row }">
                  {{ row.create_time }}
                </template>
              </el-table-column>

              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-popover placement="top" :width="300" trigger="click">
                    <template #reference>
                      <el-button type="primary" size="small">查看详情</el-button>
                    </template>
                    <div class="log-details">
                      <h4>售后项目详情</h4>
                      <div v-for="(item, index) in row.items" :key="index" class="log-item">
                        <div>订单项ID: {{ item.order_item_id }}</div>
                        <div>数量变化: <span :class="{'positive': item.quantity_change > 0, 'negative': item.quantity_change < 0}">{{ item.quantity_change }}</span></div>
                        <div>金额变化: <span :class="{'positive': item.amount_change > 0, 'negative': item.amount_change < 0}">{{ item.amount_change.toFixed(2) }} 元</span></div>
                      </div>
                    </div>
                  </el-popover>
                  <!-- 仅在状态为新建时显示已解决按钮 -->
                  <el-button
                      v-if="row.aftersale_status === 1"
                      type="success"
                      size="small"
                      style="margin-left: 10px"
                      @click="handleMarkAsResolved(row)"
                  >
                    标记已解决
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-empty v-else description="暂无售后记录" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.aftersale-page {
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
}

.skeleton-wrapper {
  padding: 20px;
}

.no-order-found {
  padding: 50px 0;
  text-align: center;
}

.aftersale-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.aftersale-order-info {
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.info-header {
  background-color: #e4e7ed;
  padding: 10px 15px;
  font-weight: 600;
  color: #303133;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dcdfe6;
}

.info-content {
  padding: 15px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
  display: flex;
}

.info-item .label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.info-item .value {
  flex: 1;
  color: #303133;
}

.aftersale-basic-info {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.aftersale-items,
.aftersale-history {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.total-amount-change {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.total-amount-change .label {
  font-weight: 600;
  margin-right: 10px;
}

.total-amount-change .value {
  font-size: 16px;
  font-weight: 600;
}

.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.log-details {
  padding: 10px;
}

.log-details h4 {
  margin-top: 0;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
}

.log-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.log-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
</style>