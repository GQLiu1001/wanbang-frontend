<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// Form data
const formData = ref({
  inventory_item_id: '',     // 库存项ID
  operation_type: 3,         // 操作类型，固定为调库（3）
  quantity_change: '',       // 数量变化
  operator_id: '',          // 操作员ID
  source_warehouse: '',     // 源仓库
  target_warehouse: '',     // 目标仓库
  remark: ''               // 备注
})

// 提交函数
const submitTransfer = async () => {
  try {
    // 验证必填字段
    const requiredFields = [
      'inventory_item_id', 'quantity_change', 'operator_id',
      'source_warehouse', 'target_warehouse'
    ]
    for (const field of requiredFields) {
      if (!formData.value[field]) {
        ElMessage.error('请填写所有必填字段')
        return
      }
    }

    // 验证数量变化为正数
    if (formData.value.quantity_change <= 0) {
      ElMessage.error('数量变化必须为正数')
      return
    }

    // API call to create transfer record - match the interface /api/inventory/logs
    const response = await fetch('/api/inventory/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inventory_item_id: Number(formData.value.inventory_item_id),
        operation_type: formData.value.operation_type, // 固定为3（调库）
        quantity_change: Number(formData.value.quantity_change),
        operator_id: Number(formData.value.operator_id),
        source_warehouse: Number(formData.value.source_warehouse),
        target_warehouse: Number(formData.value.target_warehouse),
        remark: formData.value.remark || null // Optional, can be null
      })
    })

    if (!response.ok) {
      throw new Error('调库记录创建失败')
    }

    const data = await response.json()
    if (data.code === 201) {
      ElMessage.success('调库记录创建成功')
      resetForm()
    } else {
      throw new Error(data.message || '调库记录创建失败')
    }
  } catch (error) {
    console.error('Submission failed:', error)
    ElMessage.error('调库记录创建失败，请稍后重试')
  }
}

// 重置表单函数
const resetForm = () => {
  formData.value = {
    inventory_item_id: '',
    operation_type: 3, // 固定为调库
    quantity_change: '',
    operator_id: '',
    source_warehouse: '',
    target_warehouse: '',
    remark: ''
  }
}
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