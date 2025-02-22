<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// Form data
const formData = ref({
  inventoryId: '',        // 库存商品ID
  productModel: '',       // 产品型号
  purchaseQuantity: '',   // 原始购买数量
  totalAmount: '',        // 原始订单总金额
  customerPhone: '',      // 客户手机号
  operatorId: '',         // 操作人ID
  orderRemark: ''         // 订单备注
})

// Submit function
const submitOrder = async () => {
  try {
    // Validate required fields
    const requiredFields = [
      'inventoryId', 'productModel', 'purchaseQuantity', 'totalAmount',
      'customerPhone', 'operatorId'
    ]
    for (const field of requiredFields) {
      if (!formData.value[field]) {
        ElMessage.error('请填写所有必填字段')
        return
      }
    }

    // Validate phone number format (simple check)
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(formData.value.customerPhone)) {
      ElMessage.error('请输入有效的11位手机号码')
      return
    }

    // Simulated API call - replace with your actual backend endpoint
    const response = await fetch('/api/order/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) {
      throw new Error('订单提交失败')
    }

    ElMessage.success('订单提交成功')
    // Reset form after successful submission
    resetForm()
  } catch (error) {
    console.error('Order submission failed:', error)
    ElMessage.error('订单提交失败，请稍后重试')
  }
}

// Reset form function
const resetForm = () => {
  formData.value = {
    inventoryId: '',
    productModel: '',
    purchaseQuantity: '',
    totalAmount: '',
    customerPhone: '',
    operatorId: '',
    orderRemark: ''
  }
}
</script>

<template>
  <h1>创建订单</h1>
  <hr>
  <div class="form-container">
    <el-form :model="formData" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品型号" required>
            <el-input
                v-model="formData.productModel"
                placeholder="请输入产品型号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存商品ID" required>
            <el-input
                v-model="formData.inventoryId"
                placeholder="请输入库存商品ID"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="购买数量" required>
            <el-input
                v-model.number="formData.purchaseQuantity"
                placeholder="请输入购买数量"
                type="number"
                :min="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单总金额" required>
            <el-input
                v-model.number="formData.totalAmount"
                placeholder="请输入订单总金额"
                type="number"
                :min="0"
                :step="0.01"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户手机号" required>
            <el-input
                v-model="formData.customerPhone"
                placeholder="请输入客户手机号"
                maxlength="11"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作人ID" required>
            <el-input
                v-model="formData.operatorId"
                placeholder="请输入操作人ID"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="订单备注">
            <el-input
                v-model="formData.orderRemark"
                type="textarea"
                :rows="3"
                placeholder="请输入订单备注（可选）"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="submitOrder">提交订单</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.form-container {
  padding: 40px;
  margin-left: auto;
  margin-right: auto;

  max-width: 800px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>