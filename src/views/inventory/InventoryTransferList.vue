<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getInventoryLogs, updateInventoryLog, deleteInventoryLog } from '@/api/inventoryLog';
import type { InventoryLog, LogQueryParams } from '@/types/api';

// Mocked fallback data（与 InventoryLog 类型一致）
const mockRecord: InventoryLog = {
  id: 1,
  inventory_item_id: 1,
  operation_type: 3, // 固定为调库
  quantity_change: 50, // 调拨数量为正数
  operator_id: 1,
  source_warehouse: 1,
  target_warehouse: 2,
  remark: '默认调库备注',
  create_time: '2025-02-22 14:00:00',
  update_time: '2025-02-22 14:00:00',
};

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
  create_time: '',
  update_time: '',
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
    const data = response.data;
    if (data.code === 200 && data.data?.items) {
      transferRecords.value = data.data.items;
      total.value = data.data.total || 0;
    } else {
      transferRecords.value = [mockRecord];
      total.value = 1;
      ElMessage.warning('数据格式异常，已显示默认记录');
    }
  } catch (error) {
    console.error('Failed to fetch transfer records:', error);
    transferRecords.value = [mockRecord];
    total.value = 1;
    ElMessage.warning('无法获取后端数据，已显示默认记录');
  }
};

// Load data on mount
onMounted(() => {
  fetchTransferRecords();
});

// Edit record（匹配接口 /api/inventory/logs/{id}）
const handleEdit = (row: InventoryLog) => {
  editForm.value = { ...row };
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    // 确保 operation_type 固定为 3，且 quantity_change 为正数
    editForm.value.operation_type = 3;
    if (editForm.value.quantity_change < 0) {
      editForm.value.quantity_change = Math.abs(editForm.value.quantity_change);
    }
    const updateData = {
      inventory_item_id: editForm.value.inventory_item_id,
      operation_type: editForm.value.operation_type,
      quantity_change: editForm.value.quantity_change,
      operator_id: editForm.value.operator_id,
      source_warehouse: editForm.value.source_warehouse,
      target_warehouse: editForm.value.target_warehouse,
      remark: editForm.value.remark,
    };
    const response = await updateInventoryLog(editForm.value.id!, updateData);
    const data = response.data;
    if (data.code === 200) {
      ElMessage.success('编辑成功');
      editDialogVisible.value = false;
      await fetchTransferRecords();
    } else {
      throw new Error('响应状态异常');
    }
  } catch (error) {
    console.error('Failed to update transfer record:', error);
    ElMessage.error('编辑失败，请稍后重试');
  }
};

// Delete record（匹配接口 /api/inventory/logs/{id}）
const handleDelete = async (row: InventoryLog) => {
  try {
    await ElMessageBox.confirm('确定删除此调库记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await deleteInventoryLog(row.id!);
    const data = response.data;
    if (data.code === 200) {
      ElMessage.success('删除成功');
      await fetchTransferRecords();
    } else {
      throw new Error('响应状态异常');
    }
  } catch (error) {
    if ((error as any).message !== 'cancel') {
      console.error('Failed to delete transfer record:', error);
      ElMessage.error('删除失败，请稍后重试');
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
          {{ new Date(row.create_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="update_time" label="更新时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.update_time).toLocaleString() }}
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
          v-if="transferRecords.length > 0"
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
          <el-input v-model.number="editForm.operator_id" type="number" />
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