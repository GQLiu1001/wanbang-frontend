<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getInventoryLogs, updateInventoryLog, deleteInventoryLog } from '@/api/inventoryLog';
import { useUserStore } from '@/stores/user';
import type { InventoryLog, LogQueryParams } from '@/types/interfaces.ts';

// Store transfer inventory records and search state
const transferRecords = ref<InventoryLog[]>([]);
const total = ref(0); // Total records
const page = ref(1); // Current page
const size = ref(10); // Page size
const searchDateRange = ref<[Date, Date] | []>([]);

// Dialog control
const editDialogVisible = ref(false);
const editForm = ref<InventoryLog>({
  id: 0,
  inventory_item_id: 0,
  operation_type: 3, // 固定为调库
  quantity_change: 0,
  operator_id: 0,
  source_warehouse: null,
  target_warehouse: null,
  remark: '',
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

// 获取用户信息
const userStore = useUserStore();
const operatorId = userStore.getUserInfo()?.id;

// Fetch transfer inventory records from API（限定 operation_type=3）
const fetchTransferRecords = async () => {
  try {
    const params: LogQueryParams = {
      page: page.value,
      size: size.value,
      operation_type: 3, // 限定为调库记录
    };
    if (searchDateRange.value.length === 2) {
      const [startDate, endDate] = searchDateRange.value;
      params.start_time = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
      params.end_time = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }

    const response = await getInventoryLogs(params);
    if (response.data && response.data.code === 200) {
      transferRecords.value = response.data.data.items || [];
      total.value = response.data.data.total || 0;
    } else {
      ElMessage.warning('获取数据失败：' + (response.data?.message || '未知错误'));
      transferRecords.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('Failed to fetch transfer records:', error);
    ElMessage.error('获取调库记录失败，请检查网络连接或联系管理员');
    transferRecords.value = [];
    total.value = 0;
  }
};

// Load data on mount
onMounted(() => {
  fetchTransferRecords();
});

// Edit record
const handleEdit = (row: InventoryLog) => {
  editForm.value = { ...row };
  // 设置操作人ID为当前用户ID
  editForm.value.operator_id = operatorId;
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    // 确保 operation_type 固定为 3，且 quantity_change 为正数
    if (editForm.value.quantity_change <= 0) {
      ElMessage.warning('调库数量必须大于0');
      return;
    }

    await updateInventoryLog({
      id: editForm.value.id!,
      inventory_item_id: editForm.value.inventory_item_id,
      operation_type: 3,
      quantity_change: editForm.value.quantity_change,
      operator_id: operatorId,
      source_warehouse: editForm.value.source_warehouse,
      target_warehouse: editForm.value.target_warehouse,
      remark: editForm.value.remark
    }, 3); // 传递操作类型3

    ElMessage.success('编辑成功');
    editDialogVisible.value = false;
    await fetchTransferRecords();
  } catch (error) {
    console.error('Failed to update transfer record:', error);
    ElMessage.error('编辑失败，请稍后重试');
  }
};

// Delete record
const handleDelete = async (row: InventoryLog) => {
  try {
    await ElMessageBox.confirm('确定删除此调库记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteInventoryLog(row.id!);
    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功');
      await fetchTransferRecords();
    } else {
      throw new Error(response.data?.message || '删除失败');
    }
  } catch (error) {
    if ((error as any).message !== 'cancel') {
      console.error('Failed to delete transfer record:', error);
      ElMessage.error('删除失败：' + ((error as Error).message || '未知错误'));
    }
  }
};

// Pagination handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchTransferRecords();
};

const handleSizeChange = (newSize: number) => {
  size.value = newSize;
  page.value = 1; // 重置到第一页
  fetchTransferRecords();
};

// Clear filter and refresh
const clearFilter = () => {
  searchDateRange.value = [];
  page.value = 1; // 重置到第一页
  fetchTransferRecords();
};
</script>

<template>
  <h1>调库记录</h1>
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
              @change="fetchTransferRecords"
          />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button @click="clearFilter">清除筛选</el-button>
      </el-col>
    </el-row>

    <el-table
        v-if="transferRecords.length > 0"
        :data="transferRecords"
        style="width: 100%"
        border
    >
      <el-table-column prop="id" label="日志ID" width="100" />
      <el-table-column prop="inventory_item_id" label="库存ID" width="120" />
      <el-table-column prop="quantity_change" label="数量变化" width="120">
        <template #default="{ row }">
          <span class="positive">+{{ row.quantity_change }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="operator_id" label="操作人ID" width="120" />
      <el-table-column prop="source_warehouse" label="源仓库编码" width="150" />
      <el-table-column prop="target_warehouse" label="目标仓库编码" width="150" />
      <el-table-column prop="remark" label="操作备注" min-width="200" />
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="{ row }">
          {{ row.create_time ? new Date(row.create_time).toLocaleString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="update_time" label="更新时间" width="180">
        <template #default="{ row }">
          {{ row.update_time ? new Date(row.update_time).toLocaleString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="no-data">暂无调库记录</div>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
          v-if="total > 0"
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
    <el-dialog v-model="editDialogVisible" title="编辑调库记录" width="30%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="库存ID">
          <el-input v-model.number="editForm.inventory_item_id" disabled />
        </el-form-item>
        <el-form-item label="数量变化">
          <el-input
              v-model.number="editForm.quantity_change"
              type="number"
              :min="1"
              placeholder="请输入正数"
          />
        </el-form-item>
        <el-form-item label="操作人ID">
          <el-input v-model.number="editForm.operator_id" type="number" disabled />
        </el-form-item>
        <el-form-item label="源仓库编码">
          <el-input v-model.number="editForm.source_warehouse" type="number" />
        </el-form-item>
        <el-form-item label="目标仓库编码">
          <el-input v-model.number="editForm.target_warehouse" type="number" />
        </el-form-item>
        <el-form-item label="操作备注">
          <el-input v-model="editForm.remark" type="textarea" />
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

.positive {
  color: green;
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