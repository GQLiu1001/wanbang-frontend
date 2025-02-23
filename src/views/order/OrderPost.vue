<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { postOrder } from '@/api/order';
import type { Order } from '@/types/api';

// Form data（与 Order 类型一致）
const formData = ref<Partial<Order>>({
  model_number: '',
  item_id: null,
  quantity: null,
  total_amount: null,
  customer_phone: '',
  operator_id: null,
  order_remark: '',
});

// Submit function（匹配接口 /api/orders）
const submitOrder = async () => {
  try {
    // Validate required fields
    const requiredFields: Record<keyof Order, string> = {
      model_number: '产品型号',
      item_id: '库存商品ID',
      quantity: '购买数量',
      total_amount: '订单总金额',
      customer_phone: '客户手机号',
      operator_id: '操作人ID',
    };
    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData.value[field as keyof Order];
      if (value === null || value === undefined || value === '') {
        ElMessage.error(`请填写${label}`);
        return;
      }
    }

    // Validate phone number format
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.value.customer_phone!)) {
      ElMessage.error('请输入有效的11位手机号码');
      return;
    }

    // Validate numeric fields
    if ((formData.value.quantity ?? 0) <= 0) {
      ElMessage.error('购买数量必须大于0');
      return;
    }
    if ((formData.value.total_amount ?? 0) <= 0) {
      ElMessage.error('订单总金额必须大于0');
      return;
    }

    // Prepare data for API（确保类型正确）
    const submitData = {
      model_number: formData.value.model_number!,
      item_id: Number(formData.value.item_id),
      quantity: Number(formData.value.quantity),
      total_amount: Number(formData.value.total_amount),
      customer_phone: formData.value.customer_phone!,
      operator_id: Number(formData.value.operator_id),
      order_remark: formData.value.order_remark || undefined,
    };

    // API call
    const response = await postOrder(submitData);
    const data = response.data;
    if (data.code === 201) {
      ElMessage.success('订单创建成功');
      resetForm();
    } else {
      throw new Error(data.message || '响应状态异常');
    }
  } catch (error) {
    console.error('Order creation failed:', error);
    ElMessage.error('订单创建失败，请稍后重试');
  }
};

// Reset form function
const resetForm = () => {
  formData.value = {
    model_number: '',
    item_id: null,
    quantity: null,
    total_amount: null,
    customer_phone: '',
    operator_id: null,
    order_remark: '',
  };
};
</script>

<template>
  <h1>创建订单</h1>
  <hr>
  <div class="form-container">
    <el-form :model="formData" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品型号" required>
            <el-input v-model="formData.model_number" placeholder="请输入产品型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存商品ID" required>
            <el-input
                v-model.number="formData.item_id"
                placeholder="请输入库存商品ID"
                type="number"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="购买数量" required>
            <el-input
                v-model.number="formData.quantity"
                placeholder="请输入购买数量"
                type="number"
                :min="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单总金额" required>
            <el-input
                v-model.number="formData.total_amount"
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
                v-model="formData.customer_phone"
                placeholder="请输入客户手机号"
                maxlength="11"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作人ID" required>
            <el-input
                v-model.number="formData.operator_id"
                placeholder="请输入操作人ID"
                type="number"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="订单备注">
            <el-input
                v-model="formData.order_remark"
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