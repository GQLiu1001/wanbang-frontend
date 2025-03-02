<!--订单列表-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
// 实际项目中应导入真实API
// import { getOrders, getOrderDetail, updateOrder, deleteOrder } from '@/api/order';

// 订单项类型
interface OrderItem {
  id: number;
  order_id: number;
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

const router = useRouter();

// 模拟多产品订单数据
const mockOrders: Order[] = [
  {
    id: 1,
    order_no: 'ORD202503020001',
    customer_phone: '13912345678',
    operator_id: 1,
    operator_name: '管理员',
    total_amount: 5000.00,
    adjusted_amount: null,
    order_remark: '客户批量订单',
    order_create_time: '2025-03-02 10:00:00',
    order_update_time: '2025-03-02 10:00:00',
    aftersale_status: null,
    items: [
      {
        id: 1,
        order_id: 1,
        item_id: 1,
        model_number: 'TB6001',
        specification: '600x600mm',
        manufacturer: '瓷都',
        quantity: 50,
        price_per_piece: 25.00,
        subtotal: 1250.00,
        adjusted_quantity: null
      },
      {
        id: 2,
        order_id: 1,
        item_id: 2,
        model_number: 'TB8001',
        specification: '800x800mm',
        manufacturer: '瓷都',
        quantity: 100,
        price_per_piece: 35.00,
        subtotal: 3500.00,
        adjusted_quantity: null
      },
      {
        id: 3,
        order_id: 1,
        item_id: 3,
        model_number: 'TB6002',
        specification: '600x600mm',
        manufacturer: '瓷都',
        quantity: 10,
        price_per_piece: 25.00,
        subtotal: 250.00,
        adjusted_quantity: null
      }
    ]
  },
  {
    id: 2,
    order_no: 'ORD202503020002',
    customer_phone: '13987654321',
    operator_id: 1,
    operator_name: '管理员',
    total_amount: 3500.00,
    adjusted_amount: 3325.00,
    order_remark: '客户首批订单',
    order_create_time: '2025-03-02 11:30:00',
    order_update_time: '2025-03-02 14:15:00',
    aftersale_status: 2,
    items: [
      {
        id: 4,
        order_id: 2,
        item_id: 2,
        model_number: 'TB8001',
        specification: '800x800mm',
        manufacturer: '瓷都',
        quantity: 100,
        price_per_piece: 35.00,
        subtotal: 3500.00,
        adjusted_quantity: 95
      }
    ]
  },
  {
    id: 3,
    order_no: 'ORD202503010001',
    customer_phone: '13811112222',
    operator_id: 2,
    operator_name: '销售人员',
    total_amount: 2500.00,
    adjusted_amount: 2750.00,
    order_remark: '样品订单',
    order_create_time: '2025-03-01 09:15:00',
    order_update_time: '2025-03-01 16:30:00',
    aftersale_status: 2,
    items: [
      {
        id: 5,
        order_id: 3,
        item_id: 1,
        model_number: 'TB6001',
        specification: '600x600mm',
        manufacturer: '瓷都',
        quantity: 30,
        price_per_piece: 25.00,
        subtotal: 750.00,
        adjusted_quantity: 40
      },
      {
        id: 6,
        order_id: 3,
        item_id: 4,
        model_number: 'TB7001',
        specification: '700x700mm',
        manufacturer: '瓷都',
        quantity: 50,
        price_per_piece: 35.00,
        subtotal: 1750.00,
        adjusted_quantity: 50
      }
    ]
  }
];

// 订单记录
const orderListData = ref<Order[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const searchDateRange = ref<[Date, Date] | []>([]);
const searchPhone = ref<string>('');

// 订单详情对话框控制
const detailDialogVisible = ref(false);
const currentOrderDetail = ref<Order | null>(null);
const orderItemsLoading = ref(false);

// 编辑订单对话框
const editOrderDialogVisible = ref(false);
const editOrderForm = ref<Partial<Order>>({
  id: 0,
  customer_phone: '',
  operator_id: 0,
  order_remark: ''
});

// 编辑订单项对话框
const editOrderItemDialogVisible = ref(false);
const currentEditItem = ref<OrderItem | null>(null);
const editItemForm = ref({
  id: 0,
  quantity: 0,
  price_per_piece: 0,
  subtotal: 0
});

// 添加订单项对话框
const addOrderItemDialogVisible = ref(false);
const addItemForm = ref({
  order_id: 0,
  item_id: null as number | null,
  model_number: '',
  specification: '',
  manufacturer: '',
  quantity: null as number | null,
  price_per_piece: null as number | null,
  subtotal: 0
});

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

// 获取订单列表
const fetchOrderList = () => {
  // 在实际项目中，这里应该调用API获取数据
  // 现在我们使用Mock数据

  // 筛选数据
  let filteredOrders = [...mockOrders];

  // 应用手机号筛选
  if (searchPhone.value.trim()) {
    filteredOrders = filteredOrders.filter(order =>
        order.customer_phone.includes(searchPhone.value.trim())
    );
  }

  // 应用日期筛选
  if (searchDateRange.value && searchDateRange.value.length === 2) {
    const [startDate, endDate] = searchDateRange.value;
    if (startDate && endDate) {
      const startTime = startDate.getTime();
      const endTime = new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1).getTime();

      filteredOrders = filteredOrders.filter(order => {
        const orderTime = new Date(order.order_create_time).getTime();
        return orderTime >= startTime && orderTime <= endTime;
      });
    }
  }

  // 计算分页
  const startIndex = (page.value - 1) * size.value;
  const endIndex = startIndex + size.value;

  total.value = filteredOrders.length;
  orderListData.value = filteredOrders.slice(startIndex, endIndex);
};

// 查看订单详情
const handleViewDetail = (order: Order) => {
  orderItemsLoading.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    // 在实际应用中，这里会通过API获取详细信息
    // 现在我们使用Mock数据中的订单详情
    currentOrderDetail.value = mockOrders.find(o => o.id === order.id) || null;
    detailDialogVisible.value = true;
    orderItemsLoading.value = false;
  }, 300);
};

// 跳转到售后处理页面
const handleAftersale = (order: Order) => {
  router.push({
    name: 'order-aftersales',
    params: {
      id: order.id.toString() // Convert to string explicitly
    }
  });
};

// 编辑订单基本信息
const handleEditOrder = (order: Order) => {
  editOrderForm.value = {
    id: order.id,
    customer_phone: order.customer_phone,
    operator_id: order.operator_id,
    order_remark: order.order_remark || ''
  };
  editOrderDialogVisible.value = true;
};

// 保存订单基本信息
const saveOrderEdit = () => {
  if (!editOrderForm.value.id) {
    ElMessage.error('订单ID不能为空');
    return;
  }

  if (!editOrderForm.value.customer_phone) {
    ElMessage.error('客户手机号不能为空');
    return;
  }

  if (!editOrderForm.value.operator_id) {
    ElMessage.error('操作人ID不能为空');
    return;
  }

  // 在实际项目中，这里应该调用API更新数据
  // 现在我们直接更新Mock数据
  const index = mockOrders.findIndex(order => order.id === editOrderForm.value.id);
  if (index !== -1) {
    mockOrders[index] = {
      ...mockOrders[index],
      customer_phone: editOrderForm.value.customer_phone!,
      operator_id: editOrderForm.value.operator_id!,
      order_remark: editOrderForm.value.order_remark,
      order_update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    ElMessage.success('订单基本信息更新成功');
    editOrderDialogVisible.value = false;
    fetchOrderList();
  }
};

// 编辑订单项
const handleEditItem = (item: OrderItem) => {
  currentEditItem.value = item;
  editItemForm.value = {
    id: item.id,
    quantity: item.quantity,
    price_per_piece: item.price_per_piece,
    subtotal: item.subtotal
  };
  editOrderItemDialogVisible.value = true;
};

// 更新小计金额
const updateSubtotal = () => {
  if (editItemForm.value.quantity && editItemForm.value.price_per_piece) {
    editItemForm.value.subtotal = Number((editItemForm.value.quantity * editItemForm.value.price_per_piece).toFixed(2));
  }
};

// 保存订单项编辑
const saveItemEdit = () => {
  if (!currentEditItem.value) {
    ElMessage.error('获取订单项信息失败');
    return;
  }

  if (!editItemForm.value.quantity || editItemForm.value.quantity <= 0) {
    ElMessage.error('数量必须大于0');
    return;
  }

  if (!editItemForm.value.price_per_piece || editItemForm.value.price_per_piece <= 0) {
    ElMessage.error('单价必须大于0');
    return;
  }

  // 在实际项目中，这里应该调用API更新数据
  // 现在我们直接更新Mock数据
  const orderIndex = mockOrders.findIndex(order => order.id === currentEditItem.value!.order_id);
  if (orderIndex !== -1) {
    const itemIndex = mockOrders[orderIndex].items.findIndex(item => item.id === currentEditItem.value!.id);
    if (itemIndex !== -1) {
      // 保存旧的小计金额
      const oldSubtotal = mockOrders[orderIndex].items[itemIndex].subtotal;

      // 更新订单项
      mockOrders[orderIndex].items[itemIndex] = {
        ...mockOrders[orderIndex].items[itemIndex],
        quantity: editItemForm.value.quantity,
        price_per_piece: editItemForm.value.price_per_piece,
        subtotal: editItemForm.value.subtotal
      };

      // 更新订单总金额
      mockOrders[orderIndex].total_amount = mockOrders[orderIndex].total_amount - oldSubtotal + editItemForm.value.subtotal;
      mockOrders[orderIndex].order_update_time = new Date().toISOString().replace('T', ' ').slice(0, 19);

      ElMessage.success('订单项更新成功');
      editOrderItemDialogVisible.value = false;

      // 如果当前有打开的订单详情，刷新它
      if (currentOrderDetail.value && currentOrderDetail.value.id === mockOrders[orderIndex].id) {
        currentOrderDetail.value = {...mockOrders[orderIndex]};
      }

      fetchOrderList();
    }
  }
};

// 添加订单项
const handleAddItem = (order: Order) => {
  addItemForm.value = {
    order_id: order.id,
    item_id: null,
    model_number: '',
    specification: '',
    manufacturer: '',
    quantity: null,
    price_per_piece: null,
    subtotal: 0
  };
  addOrderItemDialogVisible.value = true;
};

// 更新添加项的小计金额
const updateAddItemSubtotal = () => {
  if (addItemForm.value.quantity && addItemForm.value.price_per_piece) {
    addItemForm.value.subtotal = Number((addItemForm.value.quantity * addItemForm.value.price_per_piece).toFixed(2));
  }
};

// 保存新添加的订单项
const saveAddItem = () => {
  if (!addItemForm.value.order_id) {
    ElMessage.error('订单ID不能为空');
    return;
  }

  if (!addItemForm.value.item_id) {
    ElMessage.error('库存商品ID不能为空');
    return;
  }

  if (!addItemForm.value.model_number) {
    ElMessage.error('产品型号不能为空');
    return;
  }

  if (!addItemForm.value.specification) {
    ElMessage.error('规格不能为空');
    return;
  }

  if (!addItemForm.value.manufacturer) {
    ElMessage.error('制造商不能为空');
    return;
  }

  if (!addItemForm.value.quantity || addItemForm.value.quantity <= 0) {
    ElMessage.error('数量必须大于0');
    return;
  }

  if (!addItemForm.value.price_per_piece || addItemForm.value.price_per_piece <= 0) {
    ElMessage.error('单价必须大于0');
    return;
  }

  // 在实际项目中，这里应该调用API添加数据
  // 现在我们直接更新Mock数据
  const orderIndex = mockOrders.findIndex(order => order.id === addItemForm.value.order_id);
  if (orderIndex !== -1) {
    // 生成新的订单项ID
    const newItemId = Math.max(...mockOrders.flatMap(order => order.items.map(item => item.id))) + 1;

    // 创建新订单项
    const newItem: OrderItem = {
      id: newItemId,
      order_id: addItemForm.value.order_id,
      item_id: addItemForm.value.item_id,
      model_number: addItemForm.value.model_number,
      specification: addItemForm.value.specification,
      manufacturer: addItemForm.value.manufacturer,
      quantity: addItemForm.value.quantity,
      price_per_piece: addItemForm.value.price_per_piece,
      subtotal: addItemForm.value.subtotal,
      adjusted_quantity: null
    };

    // 添加到订单
    mockOrders[orderIndex].items.push(newItem);

    // 更新订单总金额
    mockOrders[orderIndex].total_amount += addItemForm.value.subtotal;
    mockOrders[orderIndex].order_update_time = new Date().toISOString().replace('T', ' ').slice(0, 19);

    ElMessage.success('添加订单项成功');
    addOrderItemDialogVisible.value = false;

    // 如果当前有打开的订单详情，刷新它
    if (currentOrderDetail.value && currentOrderDetail.value.id === mockOrders[orderIndex].id) {
      currentOrderDetail.value = {...mockOrders[orderIndex]};
    }

    fetchOrderList();
  }
};

// 删除订单项
const handleDeleteItem = (item: OrderItem) => {
  ElMessageBox.confirm('确定删除此订单项吗？删除后不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 在实际项目中，这里应该调用API删除数据
    // 现在我们直接更新Mock数据
    const orderIndex = mockOrders.findIndex(order => order.id === item.order_id);
    if (orderIndex !== -1) {
      const itemIndex = mockOrders[orderIndex].items.findIndex(i => i.id === item.id);
      if (itemIndex !== -1) {
        // 减去订单总金额
        mockOrders[orderIndex].total_amount -= mockOrders[orderIndex].items[itemIndex].subtotal;

        // 删除订单项
        mockOrders[orderIndex].items.splice(itemIndex, 1);
        mockOrders[orderIndex].order_update_time = new Date().toISOString().replace('T', ' ').slice(0, 19);

        ElMessage.success('订单项删除成功');

        // 如果当前有打开的订单详情，刷新它
        if (currentOrderDetail.value && currentOrderDetail.value.id === mockOrders[orderIndex].id) {
          currentOrderDetail.value = {...mockOrders[orderIndex]};
        }

        fetchOrderList();
      }
    }
  }).catch(() => {
    // 取消删除
  });
};

// 删除整个订单
const handleDeleteOrder = (order: Order) => {
  ElMessageBox.confirm('确定删除此订单及其所有商品项吗？删除后不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 在实际项目中，这里应该调用API删除数据
    // 现在我们直接更新Mock数据
    const orderIndex = mockOrders.findIndex(o => o.id === order.id);
    if (orderIndex !== -1) {
      mockOrders.splice(orderIndex, 1);
      ElMessage.success('订单删除成功');
      fetchOrderList();
    }
  }).catch(() => {
    // 取消删除
  });
};

// 分页处理
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchOrderList();
};

const handleSizeChange = (newSize: number) => {
  size.value = newSize;
  page.value = 1;
  fetchOrderList();
};

// 清除筛选条件
const clearFilter = () => {
  searchDateRange.value = [];
  searchPhone.value = '';
  page.value = 1;
  fetchOrderList();
};

// 计算商品数量
const getItemsCount = (order: Order) => {
  return order.items.length;
};

// 售后状态映射
const aftersaleStatusMap = {
  1: '新建',
  2: '已解决',
};

// 初始化
onMounted(() => {
  fetchOrderList();
});
</script>

<template>
  <h1>订单管理</h1>
  <hr>
  <div class="records-container">
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
              @change="fetchOrderList"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="按手机号筛选">
          <el-input
              v-model="searchPhone"
              placeholder="输入客户手机号"
              clearable
              @input="fetchOrderList"
          />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button @click="clearFilter">清除筛选</el-button>
      </el-col>
    </el-row>

    <!-- 订单列表 -->
    <el-table
        v-if="orderListData.length > 0"
        :data="orderListData"
        style="width: 100%"
        border
    >
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="order_no" label="订单编号" width="150" />
      <el-table-column prop="customer_phone" label="客户手机号" width="120" />
      <el-table-column label="商品数量" width="90">
        <template #default="{ row }">
          {{ getItemsCount(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="total_amount" label="订单总金额" width="120">
        <template #default="{ row }">
          {{ row.total_amount.toFixed(2) }} 元
        </template>
      </el-table-column>
      <el-table-column prop="adjusted_amount" label="调整后金额" width="120">
        <template #default="{ row }">
          {{ row.adjusted_amount ? row.adjusted_amount.toFixed(2) + ' 元' : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="order_remark" label="订单备注" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column prop="order_create_time" label="创建时间" width="160">
        <template #default="{ row }">
          {{ new Date(row.order_create_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="售后状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.aftersale_status ? (row.aftersale_status === 1 ? 'warning' : 'success') : 'info'">
            {{ row.aftersale_status ? aftersaleStatusMap[row.aftersale_status] : '无' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
          <el-button type="success" size="small" @click="handleAftersale(row)">售后</el-button>
          <el-button type="warning" size="small" @click="handleEditOrder(row)">编辑订单</el-button>
          <el-button type="danger" size="small" @click="handleDeleteOrder(row)">删除订单</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">暂无订单记录</div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
          v-if="orderListData.length > 0"
          :current-page="page"
          :page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="订单详情"
        width="80%"
        destroy-on-close
    >
      <div v-if="currentOrderDetail" class="order-detail">
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="订单ID">{{ currentOrderDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ currentOrderDetail.order_no }}</el-descriptions-item>
          <el-descriptions-item label="客户手机号">{{ currentOrderDetail.customer_phone }}</el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ currentOrderDetail.operator_name || currentOrderDetail.operator_id }}
          </el-descriptions-item>
          <el-descriptions-item label="订单总金额">{{ currentOrderDetail.total_amount.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="调整后金额">
            {{ currentOrderDetail.adjusted_amount ? currentOrderDetail.adjusted_amount.toFixed(2) + ' 元' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ new Date(currentOrderDetail.order_create_time).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ new Date(currentOrderDetail.order_update_time).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="售后状态">
            <el-tag :type="currentOrderDetail.aftersale_status ? (currentOrderDetail.aftersale_status === 1 ? 'warning' : 'success') : 'info'">
              {{ currentOrderDetail.aftersale_status ? aftersaleStatusMap[currentOrderDetail.aftersale_status] : '无' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :span="3" label="订单备注">
            {{ currentOrderDetail.order_remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="order-items-header">
          <h3>订单商品 ({{ currentOrderDetail.items.length }}项)</h3>
          <div>
            <el-button type="success" size="small" @click="handleAddItem(currentOrderDetail)">添加商品</el-button>
            <el-button type="primary" size="small" @click="handleAftersale(currentOrderDetail)">
              前往售后处理
            </el-button>
          </div>
        </div>

        <el-table
            v-loading="orderItemsLoading"
            :data="currentOrderDetail.items"
            border
            style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="model_number" label="产品型号" width="120" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="manufacturer" label="制造商" width="120" />
          <el-table-column prop="quantity" label="原始数量" width="90" />
          <el-table-column prop="adjusted_quantity" label="调整数量" width="90">
            <template #default="{ row }">
              {{ row.adjusted_quantity !== null && row.adjusted_quantity !== undefined ? row.adjusted_quantity : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="price_per_piece" label="单价" width="90">
            <template #default="{ row }">
              {{ row.price_per_piece.toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120">
            <template #default="{ row }">
              {{ row.subtotal.toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button type="warning" size="small" @click="handleEditItem(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDeleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑订单基本信息对话框 -->
    <el-dialog
        v-model="editOrderDialogVisible"
        title="编辑订单基本信息"
        width="40%"
        destroy-on-close
    >
      <el-form :model="editOrderForm" label-width="120px">
        <el-form-item label="客户手机号" required>
          <el-input
              v-model="editOrderForm.customer_phone"
              placeholder="请输入客户手机号"
              maxlength="11"
          />
        </el-form-item>
        <el-form-item label="操作人ID" required>
          <el-input
              v-model.number="editOrderForm.operator_id"
              placeholder="请输入操作人ID"
              type="number"
          />
        </el-form-item>
        <el-form-item label="订单备注">
          <el-input
              v-model="editOrderForm.order_remark"
              type="textarea"
              :rows="3"
              placeholder="请输入订单备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editOrderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOrderEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑订单项对话框 -->
    <el-dialog
        v-model="editOrderItemDialogVisible"
        title="编辑订单商品"
        width="40%"
        destroy-on-close
    >
      <div v-if="currentEditItem" class="item-info">
        <div class="info-row">
          <span class="label">产品型号:</span>
          <span class="value">{{ currentEditItem.model_number }}</span>
        </div>
        <div class="info-row">
          <span class="label">规格:</span>
          <span class="value">{{ currentEditItem.specification }}</span>
        </div>
        <div class="info-row">
          <span class="label">制造商:</span>
          <span class="value">{{ currentEditItem.manufacturer }}</span>
        </div>
      </div>

      <el-divider></el-divider>

      <el-form :model="editItemForm" label-width="120px">
        <el-form-item label="数量" required>
          <el-input
              v-model.number="editItemForm.quantity"
              placeholder="请输入数量"
              type="number"
              :min="1"
              @input="updateSubtotal"
          />
        </el-form-item>
        <el-form-item label="单价" required>
          <el-input
              v-model.number="editItemForm.price_per_piece"
              placeholder="请输入单价"
              type="number"
              :min="0.01"
              :step="0.01"
              @input="updateSubtotal"
          />
        </el-form-item>
        <el-form-item label="小计">
          <el-input
              v-model.number="editItemForm.subtotal"
              disabled
              type="number"
              step="0.01"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editOrderItemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveItemEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加订单项对话框 -->
    <el-dialog
        v-model="addOrderItemDialogVisible"
        title="添加商品"
        width="50%"
        destroy-on-close
    >
      <el-form :model="addItemForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存商品ID" required>
              <el-input
                  v-model.number="addItemForm.item_id"
                  placeholder="请输入库存商品ID"
                  type="number"
                  :min="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品型号" required>
              <el-input
                  v-model="addItemForm.model_number"
                  placeholder="请输入产品型号"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格" required>
              <el-input
                  v-model="addItemForm.specification"
                  placeholder="请输入规格，如：600x600mm"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="制造商" required>
              <el-input
                  v-model="addItemForm.manufacturer"
                  placeholder="请输入制造商"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="数量" required>
              <el-input
                  v-model.number="addItemForm.quantity"
                  placeholder="请输入数量"
                  type="number"
                  :min="1"
                  @input="updateAddItemSubtotal"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单价" required>
              <el-input
                  v-model.number="addItemForm.price_per_piece"
                  placeholder="请输入单价"
                  type="number"
                  :min="0.01"
                  :step="0.01"
                  @input="updateAddItemSubtotal"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="小计">
              <el-input
                  v-model.number="addItemForm.subtotal"
                  disabled
                  type="number"
                  step="0.01"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="addOrderItemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddItem">添加</el-button>
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

.order-detail {
  margin-bottom: 20px;
}

.order-items-header {
  margin: 20px 0 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-items-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.item-info {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row .label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.info-row .value {
  flex: 1;
  color: #303133;
}
</style>