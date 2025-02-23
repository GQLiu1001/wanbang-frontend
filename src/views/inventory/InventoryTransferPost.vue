<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { postInventoryLog } from '@/api/inventoryLog';
import type { InventoryLog } from '@/types/api';

// Form data（与 InventoryLog 类型一致）
const formData = ref<Partial<InventoryLog>>({
  inventory_item_id: null,
  operation_type: 3, // 固定为调库（3）
  quantity_change: null,
  operator_id: null,
  source_warehouse: null,
  target_warehouse: null,
  remark: '',
});

// Submit function（匹配接口 /api/inventory/logs）
const submitTransfer = async () => {
  try {
    // Validate required fields
    const requiredFields: Record<keyof InventoryLog, string> = {
      inventory_item_id: '库存项ID',
      quantity_change: '数量变化',
      operator_id: '操作员ID',
      source_warehouse: '源仓库',
      target_warehouse: '目标仓库',
    };
    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData.value[field as keyof InventoryLog];
      if (value === null || value === undefined || value === '') {
        ElMessage.error(`请填写${label}`);
        return;
      }
    }

    // Validate quantity_change is positive
    if ((formData.value.quantity_change ?? 0) <= 0) {
      ElMessage.error('数量变化必须为正数');
      return;
    }

    // Prepare data for API（确保类型正确）
    const submitData = {
      inventory_item_id: Number(formData.value.inventory_item_id),
      operation_type: formData.value.operation_type, // 固定为 3
      quantity_change: Number(formData.value.quantity_change),
      operator_id: Number(formData.value.operator_id),
      source_warehouse: Number(formData.value.source_warehouse),
      target_warehouse: Number(formData.value.target_warehouse),
      remark: formData.value.remark || undefined, // 可选字段，空字符串转为 undefined
    };

    // API call
    const response = await postInventoryLog(submitData);
    const data = response.data;
    if (data.code === 201) {
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
    inventory_item_id: null,
    operation_type: 3, // 固定为调库
    quantity_change: null,
    operator_id: null,
    source_warehouse: null,
    target_warehouse: null,
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
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="数量变化" required>
            <el-input
                v-model.number="formData.quantity_change"
                placeholder="请输入数量变化（正数）"
                type="number"
                :min="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作员ID" required>
            <el-input
                v-model.number="formData.operator_id"
                placeholder="请输入操作员ID"
                type="number"
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标仓库" required>
            <el-form-item label="目标仓库" required>
              <el-input
                  v-model.number="formData.target_warehouse"
                  placeholder="请输入目标仓库编号"
                  type="number"
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