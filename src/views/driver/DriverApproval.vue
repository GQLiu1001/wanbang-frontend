<template>
  <div class="driver-approval-container">
    <h1>司机审核</h1>
    <hr>
    
    <el-card class="filter-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="司机姓名">
            <el-input v-model="queryForm.name" placeholder="请输入司机姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="手机号码">
            <el-input v-model="queryForm.phone" placeholder="请输入手机号码"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="审核状态">
            <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
              <el-option label="待审核" :value="1"></el-option>
              <el-option label="已审核" :value="2"></el-option>
              <el-option label="已拒绝" :value="3"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="loadDrivers">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="driver-list-container">
      <el-table :data="driverList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="司机姓名" width="120" />
        <el-table-column prop="phone" label="手机号码" width="150" />
        <el-table-column prop="license_number" label="驾驶证号码" width="180" />
        <el-table-column prop="vehicle_type" label="车辆类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 2" type="success">已审核</el-tag>
            <el-tag v-else-if="row.status === 3" type="danger">已拒绝</el-tag>
            <el-tag v-else type="info">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registration_time" label="注册时间" width="180">
          <template #default="{ row }">
            {{ row.registration_time ? new Date(row.registration_time).toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="approval_time" label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.approval_time ? new Date(row.approval_time).toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="scope.row.status === 1"
                type="success" 
                size="small" 
                @click="handleApprove(scope.row)"
              >审核通过</el-button>
              <el-button 
                v-if="scope.row.status === 1"
                type="danger" 
                size="small" 
                @click="handleReject(scope.row)"
              >拒绝</el-button>
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
        <div v-else class="no-data">暂无司机数据</div>
      </div>
    </el-card>

    <!-- 审核备注对话框 -->
    <el-dialog v-model="approveDialogVisible" title="审核通过" width="500px">
      <el-form label-width="100px">
        <el-form-item label="司机姓名:">
          <span>{{ currentDriver?.name }}</span>
        </el-form-item>
        <el-form-item label="手机号码:">
          <span>{{ currentDriver?.phone }}</span>
        </el-form-item>
        <el-form-item label="审核备注:">
          <el-input v-model="approvalRemark" type="textarea" placeholder="请输入审核备注信息"></el-input>
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

const queryForm = reactive<DriverQueryParams>({
  name: '',
  phone: '',
  status: 1, // 默认查询待审核的司机
  page: 1,
  size: 10
});

const operatorId = computed(() => userStore.getUserInfo()?.id || 0);

const loadDrivers = async () => {
  loading.value = true;
  try {
    const response = await getPendingDrivers(queryForm);
    const data = response.data;
    if (data.code === 200 && data.data) {
      driverList.value = data.data.items;
      total.value = data.data.total || 0;
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
    loading.value = false;
  }
};

const resetQuery = () => {
  queryForm.name = '';
  queryForm.phone = '';
  queryForm.status = 1;
  queryForm.page = 1;
  loadDrivers();
};

const handleSizeChange = (val: number) => {
  queryForm.size = val;
  loadDrivers();
};

const handleCurrentChange = (val: number) => {
  queryForm.page = val;
  loadDrivers();
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
    approvalLoading.value = false;
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

onMounted(() => {
  loadDrivers();
});
</script>

<style scoped>
.driver-approval-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
.driver-list-container {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: center;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.no-data {
  padding: 20px;
  text-align: center;
  color: #909399;
}
</style> 