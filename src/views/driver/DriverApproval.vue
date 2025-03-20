<template>
  <div class="driver-approval-container">
    <h1>司机审核</h1>
    <hr>
    
    <el-card class="driver-list-container" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">司机管理列表</span>
        </div>
      </template>
      <el-table 
        :data="driverList" 
        style="width: 100%" 
        v-loading="loading" 
        border 
        stripe
        highlight-current-row
        header-cell-class-name="table-header"
      >
        <el-table-column prop="id" label="ID" min-width="10%" align="center" />
        <el-table-column prop="name" label="司机姓名" min-width="20%" align="center" />
        <el-table-column prop="phone" label="手机号码" min-width="30%" align="center" />
        <el-table-column prop="status" label="状态" min-width="15%">
          <template #default="{ row }">
            <div class="tag-center">
              <el-tag v-if="row.status === 1" type="warning">待审核</el-tag>
              <el-tag v-else-if="row.status === 2" type="success">已审核</el-tag>
              <el-tag v-else-if="row.status === 3" type="danger">已拒绝</el-tag>
              <el-tag v-else type="info">未知</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="25%" fixed="right">
          <template #default="scope">
            <div class="button-row-center">
              <!-- 待审核状态下显示审核和拒绝按钮 -->
              <template v-if="scope.row.status === 1">
                <el-button
                  type="success" 
                  size="small" 
                  @click="handleApprove(scope.row)"
                >审核通过</el-button>
                <el-button
                  type="warning" 
                  size="small" 
                  @click="handleReject(scope.row)"
                >拒绝</el-button>
              </template>
              <!-- 所有状态都显示删除按钮 -->
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container" v-if="driverList.length === 0">
        <el-empty description="暂无符合条件的司机数据"></el-empty>
      </div>
    </el-card>

    <!-- 审核备注对话框 -->
    <el-dialog v-model="approveDialogVisible" title="审核通过" width="400px">
      <el-form label-width="100px">
        <el-form-item label="司机姓名:">
          <span>{{ currentDriver?.name }}</span>
        </el-form-item>
        <el-form-item label="手机号码:">
          <span>{{ currentDriver?.phone }}</span>
        </el-form-item>
        <el-form-item label="审核备注:">
          <el-input v-model="approvalRemark" type="textarea" rows="3" placeholder="请输入审核备注信息（选填）"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button type="success" @click="confirmApprove" :loading="approvalLoading">确认审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPendingDrivers, approveDriver, rejectDriver } from '@/api/driver';
import { useUserStore } from '@/stores/user';
import type { DriverQueryParams, Driver } from '@/types/interfaces';

const userStore = useUserStore();
const loading = ref(false);
const approvalLoading = ref(false);
const approveDialogVisible = ref(false);
const driverList = ref<Driver[]>([]);
const total = ref(0);
const currentDriver = ref<Driver | null>(null);
const approvalRemark = ref('');
const useMockData = ref(true); // 添加一个标志来控制是否使用模拟数据

// 模拟司机数据
const mockDrivers: Driver[] = [
  {
    id: 1001,
    name: '张三',
    phone: '13812345678',
    license_number: 'A12345678',
    vehicle_type: '厢式货车',
    status: 1,
    registration_time: new Date().toISOString(),
  },
  {
    id: 1002,
    name: '李四',
    phone: '13987654321',
    license_number: 'B87654321',
    vehicle_type: '平板货车',
    status: 1,
    registration_time: new Date().toISOString(),
  },
  {
    id: 1003,
    name: '王五',
    phone: '13567891234',
    license_number: 'C56789012',
    vehicle_type: '冷藏车',
    status: 2,
    registration_time: new Date().toISOString(),
    approval_time: new Date().toISOString(),
  },
  {
    id: 1004,
    name: '赵六',
    phone: '13612378945',
    license_number: 'D12378945',
    vehicle_type: '集装箱车',
    status: 3,
    registration_time: new Date().toISOString(),
    approval_time: new Date().toISOString(),
  },
  {
    id: 1005,
    name: '陈七',
    phone: '13712345670',
    license_number: 'E12345670',
    vehicle_type: '厢式货车',
    status: 2,
    registration_time: new Date().toISOString(),
    approval_time: new Date().toISOString(),
  }
];

const queryForm = reactive<DriverQueryParams>({
  status: 1, // 默认查询待审核的司机
});

const operatorId = computed(() => userStore.getUserInfo()?.id || 0);

const loadDrivers = async () => {
  loading.value = true;
  try {
    if (useMockData.value) {
      // 使用模拟数据
      setTimeout(() => {
        // 显示所有司机，不再按状态筛选
        driverList.value = mockDrivers;
        total.value = driverList.value.length;
        loading.value = false;
      }, 500); // 模拟网络延迟
      return;
    }

    // 获取所有司机，不再使用状态筛选
    const params = {};
    
    const response = await getPendingDrivers(params);
    const data = response.data;
    if (data.code === 200 && data.data) {
      driverList.value = data.data.items || data.data;
      total.value = driverList.value.length;
    } else {
      driverList.value = [];
      total.value = 0;
      ElMessage.warning(data.message || '获取司机列表失败');
    }
  } catch (error) {
    console.error('获取司机列表失败:', error);
    ElMessage.error('获取司机列表失败，请稍后重试');
    driverList.value = [];
    total.value = 0;
  } finally {
    if (!useMockData.value) {
      loading.value = false;
    }
  }
};

const handleApprove = (row: Driver) => {
  currentDriver.value = row;
  approvalRemark.value = '';
  approveDialogVisible.value = true;
};

const confirmApprove = async () => {
  if (!currentDriver.value || !currentDriver.value.id) {
    ElMessage.error('司机信息不完整');
    return;
  }

  approvalLoading.value = true;
  try {
    if (useMockData.value) {
      // 使用模拟数据时，直接更新本地数据
      setTimeout(() => {
        const index = mockDrivers.findIndex(driver => driver.id === currentDriver.value?.id);
        if (index !== -1) {
          mockDrivers[index].status = 2;
          mockDrivers[index].approval_time = new Date().toISOString();
        }
        ElMessage.success('司机审核通过成功');
        approveDialogVisible.value = false;
        loadDrivers();
        approvalLoading.value = false;
      }, 500);
      return;
    }

    const approvalData = {
      operator_id: operatorId.value,
      remark: approvalRemark.value
    };

    const response = await approveDriver(currentDriver.value.id, approvalData);
    
    if (response.status === 200 || response.status === 201) {
      ElMessage.success('司机审核通过成功');
      approveDialogVisible.value = false;
      await loadDrivers();
    } else {
      throw new Error(response.data?.message || '审核失败');
    }
  } catch (error) {
    console.error('审核失败:', error);
    ElMessage.error('审核失败，请稍后重试');
  } finally {
    if (!useMockData.value) {
      approvalLoading.value = false;
    }
  }
};

const handleReject = (row: Driver) => {
  ElMessageBox.confirm(
    `确定要拒绝司机 ${row.name} 的申请吗？`,
    '拒绝确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        if (useMockData.value) {
          // 使用模拟数据时，直接更新本地数据
          setTimeout(() => {
            const index = mockDrivers.findIndex(driver => driver.id === row.id);
            if (index !== -1) {
              mockDrivers[index].status = 3;
              mockDrivers[index].approval_time = new Date().toISOString();
            }
            ElMessage.success('已拒绝该司机申请');
            loadDrivers();
          }, 500);
          return;
        }

        const response = await rejectDriver(row.id);
        if (response.status === 200 || response.status === 204) {
          ElMessage.success('已拒绝该司机申请');
          await loadDrivers();
        } else {
          throw new Error(response.data?.message || '操作失败');
        }
      } catch (error) {
        console.error('拒绝失败:', error);
        ElMessage.error('拒绝失败，请稍后重试');
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

const handleDelete = (row: Driver) => {
  ElMessageBox.confirm(
    `确定要删除司机 ${row.name} 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        if (useMockData.value) {
          // 使用模拟数据时，直接更新本地数据
          setTimeout(() => {
            const index = mockDrivers.findIndex(driver => driver.id === row.id);
            if (index !== -1) {
              mockDrivers.splice(index, 1);
            }
            ElMessage.success('已删除该司机');
            loadDrivers();
          }, 500);
          return;
        }

        // 这里应该添加删除司机的API调用
        // const response = await deleteDriver(row.id);
        ElMessage.success('已删除该司机');
        await loadDrivers();
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败，请稍后重试');
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

onMounted(() => {
  loadDrivers();
});
</script>

<style scoped>
.driver-approval-container {
  padding: 20px;
}
.driver-list-container {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-title {
  font-size: 16px;
  font-weight: bold;
}
.pagination-container {
  margin-top: 20px;
  text-align: center;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.button-row {
  display: flex;
  gap: 5px;
}
.button-row-center {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.tag-center {
  display: flex;
  justify-content: center;
}
.no-data {
  padding: 20px;
  text-align: center;
  color: #909399;
}
:deep(.table-header) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}
</style> 