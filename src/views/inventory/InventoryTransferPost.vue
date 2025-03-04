<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { postTransferLog } from '@/api/inventoryLog';
import type { TransferLogRequest } from '@/types/interfaces.ts';

// Form data
const formData = ref<TransferLogRequest>({
  inventory_item_id: undefined,
  operator_id: undefined,
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
      operator_id: '操作员ID',
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
    operator_id: undefined,
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
                placeholder="请输入操作员ID"
                type="number"
                min="1"
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

      <el-form-item>
        <el-button type="primary" @click="submitTransfer">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
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
</style>