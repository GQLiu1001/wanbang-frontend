<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrders, updateOrder, deleteOrder } from '@/api/order';
import type { Order, OrderQueryParams } from '@/types/api';

// Mocked fallback data（与 Order 类型一致）
const mockRecord: Order = {
  order_no: 'ORD123456',
  item_id: 1,
  quantity: 10,
  adjusted_quantity: null,
  total_amount: 1000.00,
  adjusted_amount: null,
  customer_phone: '13812345678',
  operator_id: 1,
  order_remark: '测试订单',
  aftersale_type: null,
  aftersale_status: null,
  order_create_time: '2025-02-21 10:00:00',
  order_update_time: '2025-02-21 10:00:00',
};

// Store order records and search state
const orderRecords = ref<Order[]>([]);
const total = ref(0); // Total records
const page = ref(1); // Current page
const size = ref(10); // Page size
const searchDateRange = ref<[Date, Date] | []>([]);
const searchPhone = ref<string>('');

// Dialog control
const editDialogVisible = ref(false);
const editForm = ref<Order>({
  order_no: '',
  item_id: 0,
  quantity: 0,
  adjusted_quantity: null,
  total_amount: 0,
  adjusted_amount: null,
  customer_phone: '',
  operator_id: null,
  order_remark: '',
  aftersale_type: null,
  aftersale_status: null,
  order_create_time: '',
  order_update_time: '',
});

// Define picker options for el-date-picker
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
  disabledDate(time: Date) {
    const now = new Date();
    const tenYearsAgo = now.getFullYear() - 10;
    const tenYearsLater = now.getFullYear() + 10;
    return time.getFullYear() < tenYearsAgo || time.getFullYear() > tenYearsLater;
  },
};

// Fetch order records from API（匹配 /api/orders）
const fetchOrderRecords = async () => {
  try {
    const params: OrderQueryParams = {
      page: page.value,
      size: size.value,
    };
    if (searchDateRange.value.length === 2) {
      const [startDate, endDate] = searchDateRange.value;
      params.start_time = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
      params.end_time = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }
    if (searchPhone.value.trim()) {
      params.customer_phone = searchPhone.value.trim();
    }

    const response = await getOrders(params);
    const data = response.data;
    if (data.code === 200 && data.data?.items) {
      orderRecords.value = data.data.items;
      total.value = data.data.total || 0;
    } else {
      orderRecords.value = [mockRecord];
      total.value = 1;
      ElMessage.warning('数据格式异常，已显示默认记录');
    }
  } catch (error) {
    console.error('Failed to fetch order records:', error);
    orderRecords.value = [mockRecord];
    total.value = 1;
    ElMessage.warning('无法获取后端数据，已显示默认记录');
  }
};

// Load data on mount
onMounted(() => {
  fetchOrderRecords();
});

// Edit record（匹配 /api/orders/{order_no}）
const handleEdit = (row: Order) => {
  editForm.value = { ...row };
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    const updateData = {
      item_id: editForm.value.item_id,
      quantity: editForm.value.quantity,
      total_amount: editForm.value.total_amount,
      customer_phone: editForm.value.customer_phone,
      operator_id: editForm.value.operator_id,
      order_remark: editForm.value.order_remark || undefined,
    };
    const response = await updateOrder(editForm.value.order_no!, updateData);
    const data = response.data;
    if (data.code === 200) {
      ElMessage.success('编辑成功');
      editDialogVisible.value = false;
      await fetchOrderRecords();
    } else {
      throw new Error('响应状态异常');
    }
  } catch (error) {
    console.error('Failed to update order record:', error);
    ElMessage.error('编辑失败，请稍后重试');
  }
};

// Delete record（匹配 /api/orders/{order_no}）
const handleDelete = async (row: Order) => {
  try {
    await ElMessageBox.confirm('确定删除此订单记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await deleteOrder(row.order_no!);
    const data = response.data;
    if (data.code === 200) {
      ElMessage.success('删除成功');
      await fetchOrderRecords();
    } else {
      throw new Error('响应状态异常');
    }
  } catch (error) {
    if ((error as any).message !== 'cancel') {
      console.error('Failed to delete order record:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

// Pagination handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchOrderRecords();
};

const handleSizeChange = (newSize: number) => {
  size.value = newSize;
  page.value = 1; // 重置到第一页
  fetchOrderRecords();
};

// Clear filter and refresh
const clearFilter = () => {
  searchDateRange.value = [];
  searchPhone.value = '';
  page.value = 1; // 重置到第一页
  fetchOrderRecords();
};

// Aftersale type and status mapping
const aftersaleTypeMap = {
  1: '买多退货退款',
  2: '买少补货补款',
};
const aftersaleStatusMap = {
  1: '新建',
  2: '已解决',
};
</script>

<template>
  <h1>订单记录</h1>
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
              @change="fetchOrderRecords"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="按手机号筛选">
          <el-input
              v-model="searchPhone"
              placeholder="输入客户手机号"
              clearable
              @input="fetchOrderRecords"
          />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button @click="clearFilter">清除筛选</el-button>
      </el-col>
    </el-row>

    <el-table
        v-if="orderRecords.length > 0"
        :data="orderRecords"
        style="width: 100%"
        border
    >
      <el-table-column prop="order_no" label="订单编号" width="150" />
      <el-table-column prop="item_id" label="库存商品ID" width="100" />
      <el-table-column prop="quantity" label="原始购买数量" width="100" />
      <el-table-column prop="adjusted_quantity" label="调整后数量" width="100">
        <template #default="{ row }">
          {{ row.adjusted_quantity !== null ? row.adjusted_quantity : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="total_amount" label="原始订单金额" width="150" />
      <el-table-column prop="adjusted_amount" label="调整后金额" width="150">
        <template #default="{ row }">
          {{ row.adjusted_amount !== null ? row.adjusted_amount : '-' }}
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
      <el-table-column label="售后状态" width="100">
        <template #default="{ row }">
          {{ row.aftersale_status ? aftersaleStatusMap[row.aftersale_status] : '无' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">暂无订单记录</div>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
          v-if="orderRecords.length > 0"
          :current-page="page"
          :page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑订单记录" width="35%">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="订单编号">
          <el-input v-model="editForm.order_no" disabled />
        </el-form-item>
        <el-form-item label="库存商品ID">
          <el-input v-model.number="editForm.item_id" type="number" />
        </el-form-item>
        <el-form-item label="原始购买数量">
          <el-input v-model.number="editForm.quantity" type="number" />
        </el-form-item>
        <el-form-item label="调整后数量">
          <el-input
              v-model.number="editForm.adjusted_quantity"
              type="number"
              placeholder="留空表示无调整"
          />
        </el-form-item>
        <el-form-item label="原始订单金额">
          <el-input v-model.number="editForm.total_amount" type="number" step="0.01" />
        </el-form-item>
        <el-form-item label="调整后金额">
          <el-input
              v-model.number="editForm.adjusted_amount"
              type="number"
              step="0.01"
              placeholder="留空表示无调整"
          />
        </el-form-item>
        <el-form-item label="客户手机号">
          <el-input v-model="editForm.customer_phone" />
        </el-form-item>
        <el-form-item label="操作人ID">
          <el-input
              v-model.number="editForm.operator_id"
              type="number"
              placeholder="留空表示无"
          />
        </el-form-item>
        <el-form-item label="订单备注">
          <el-input v-model="editForm.order_remark" type="textarea" />
        </el-form-item>
        <el-form-item label="售后类型">
          <el-select v-model="editForm.aftersale_type" placeholder="请选择售后类型">
            <el-option label="无" :value="null" />
            <el-option label="买多退货退款" :value="1" />
            <el-option label="买少补货补款" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="售后状态">
          <el-select v-model="editForm.aftersale_status" placeholder="请选择售后状态">
            <el-option label="无" :value="null" />
            <el-option label="新建" :value="1" />
            <el-option label="已解决" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 20px;
}
</style>