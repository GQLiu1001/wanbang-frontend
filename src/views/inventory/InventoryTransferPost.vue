<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { postTransferLog } from '@/api/inventoryLog';
import { useUserStore } from '@/stores/user';
import type { TransferLogRequest } from '@/types/interfaces.ts';

// 获取用户信息
const userStore = useUserStore();
const operatorId = userStore.getUserInfo()?.id;

// Form data
const formData = ref<TransferLogRequest>({
  inventory_item_id: undefined,
  operator_id: operatorId,
  source_warehouse: undefined,
  target_warehouse: undefined,
  remark: '',
});

// Submit function
const submitTransfer = async () => {
  try {
    // Validate required fields
    const requiredFields = {
      inventory_item_id: '库存项ID',
      source_warehouse: '源仓库',
      target_warehouse: '目标仓库',
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData.value[field as keyof TransferLogRequest];
      if (value === undefined || value === null || value === '') {
        ElMessage.error(`请填写${label}`);
        return;
      }
    }

    // Validate warehouses are different
    if (formData.value.source_warehouse === formData.value.target_warehouse) {
      ElMessage.error('源仓库和目标仓库不能相同');
      return;
    }

    // 确保使用当前用户ID
    formData.value.operator_id = operatorId;

    // API call
    const response = await postTransferLog(formData.value);
    const data = response.data;
    if (data.code === 200 || data.code === 201) {
      ElMessage.success('调库记录创建成功');
      resetForm();
    } else {
      throw new Error(data.message || '响应状态异常');
    }
  } catch (error) {
    console.error('Submission failed:', error);
    ElMessage.error('调库记录创建失败，请稍后重试');
  }
};

// Reset form function
const resetForm = () => {
  formData.value = {
    inventory_item_id: undefined,
    operator_id: operatorId,
    source_warehouse: undefined,
    target_warehouse: undefined,
    remark: '',
  };
};
</script>

<template>
  <h1>创建调库记录</h1>
  <hr>
  <div class="form-container">
    <el-form :model="formData" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="库存项ID" required>
            <el-input
                v-model.number="formData.inventory_item_id"
                placeholder="请输入库存项ID"
                type="number"
                min="1"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="操作员ID" required>
            <el-input
                v-model.number="formData.operator_id"
                placeholder="系统自动获取"
                type="number"
                disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="源仓库" required>
            <el-input
                v-model.number="formData.source_warehouse"
                placeholder="请输入源仓库编号"
                type="number"
                min="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标仓库" required>
            <el-input
                v-model.number="formData.target_warehouse"
                placeholder="请输入目标仓库编号"
                type="number"
                min="1"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
                v-model="formData.remark"
                type="textarea"
                placeholder="请输入备注信息，如：从1号仓调到2号仓"
                :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item class="action-buttons">
        <el-button type="primary" @click="submitTransfer" class="action-button">提交</el-button>
        <el-button @click="resetForm" class="action-button">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.form-container {
  padding: 40px;
}

.el-select {
  width: 100%;
}

/* 调整按钮样式和间距 */
.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 20px; /* 增加按钮之间的间距 */
  flex-wrap: wrap;
}

.action-button {
  min-width: 120px; /* 设置按钮最小宽度，使其更容易点击 */
  padding: 12px 20px; /* 增加内边距，使按钮更大更易点击 */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .form-container {
    padding: 20px 10px;
  }
  
  .action-buttons {
    flex-direction: column; /* 在移动端将按钮垂直排列 */
    align-items: stretch; /* 拉伸按钮宽度填满容器 */
    gap: 15px;
  }
  
  .action-button {
    width: 100%; /* 在移动端下按钮宽度100% */
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  /* 确保表单项在移动端显示正常 */
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>