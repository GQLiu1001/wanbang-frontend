<!--创建订单-->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { postOrder } from '@/api/order';

// 订单项数据结构
interface OrderItemForm {
  id?: number;
  model_number: string;
  item_id: number | null;
  quantity: number | null;
  price_per_piece: number | null;
  subtotal: number | null;
}

// 订单主表单数据
const orderForm = ref({
  customer_phone: '',
  operator_id: null as number | null,
  order_remark: '',
  total_amount: 0,
});

// 订单项列表
const orderItems = ref<OrderItemForm[]>([
  {
    model_number: '',
    item_id: null,
    quantity: null,
    price_per_piece: null,
    subtotal: null,
  }
]);

// 计算总金额
const calculateTotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + (item.subtotal || 0);
  }, 0);
});

// 更新订单项小计金额
const updateSubtotal = (index: number) => {
  const item = orderItems.value[index];
  if (item.quantity && item.price_per_piece) {
    item.subtotal = Number((item.quantity * item.price_per_piece).toFixed(2));
    // 自动更新总金额
    orderForm.value.total_amount = calculateTotal.value;
  }
};

// 添加新的订单项
const addOrderItem = () => {
  orderItems.value.push({
    model_number: '',
    item_id: null,
    quantity: null,
    price_per_piece: null,
    subtotal: null,
  });
};

// 移除订单项
const removeOrderItem = (index: number) => {
  if (orderItems.value.length > 1) {
    orderItems.value.splice(index, 1);
    // 更新总金额
    orderForm.value.total_amount = calculateTotal.value;
  } else {
    ElMessage.warning('订单至少需要一项商品');
  }
};

// 提交订单
const submitOrder = async () => {
  try {
    // 验证主表单
    if (!orderForm.value.customer_phone) {
      ElMessage.error('请填写客户手机号');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(orderForm.value.customer_phone)) {
      ElMessage.error('请输入有效的11位手机号码');
      return;
    }

    if (!orderForm.value.operator_id) {
      ElMessage.error('请填写操作人ID');
      return;
    }

    // 验证订单项
    for (let i = 0; i < orderItems.value.length; i++) {
      const item = orderItems.value[i];
      if (!item.model_number || !item.item_id || !item.quantity || !item.price_per_piece) {
        ElMessage.error(`请完善第${i + 1}项商品的信息`);
        return;
      }

      if (item.quantity <= 0) {
        ElMessage.error(`第${i + 1}项商品的数量必须大于0`);
        return;
      }

      if (item.price_per_piece <= 0) {
        ElMessage.error(`第${i + 1}项商品的单价必须大于0`);
        return;
      }
    }

    // 准备提交数据
    const submitData = {
      customer_phone: orderForm.value.customer_phone,
      operator_id: Number(orderForm.value.operator_id),
      order_remark: orderForm.value.order_remark || undefined,
      total_amount: orderForm.value.total_amount,
      items: orderItems.value.map(item => ({
        model_number: item.model_number,
        item_id: Number(item.item_id),
        quantity: Number(item.quantity),
        price_per_piece: Number(item.price_per_piece),
        subtotal: Number(item.subtotal)
      }))
    };

    // 调用API
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

// 重置表单
const resetForm = () => {
  orderForm.value = {
    customer_phone: '',
    operator_id: null,
    order_remark: '',
    total_amount: 0
  };

  orderItems.value = [{
    model_number: '',
    item_id: null,
    quantity: null,
    price_per_piece: null,
    subtotal: null
  }];
};
</script>

<template>
  <h1>创建订单</h1>
  <hr>
  <div class="form-container">
    <el-form label-width="120px">
      <!-- 订单基本信息 -->
      <el-card class="order-card">
        <template #header>
          <div class="card-header">
            <span>订单基本信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户手机号" required>
              <el-input
                  v-model="orderForm.customer_phone"
                  placeholder="请输入客户手机号"
                  maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作人ID" required>
              <el-input
                  v-model.number="orderForm.operator_id"
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
                  v-model="orderForm.order_remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入订单备注（可选）"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 订单商品列表 -->
      <el-card class="order-card">
        <template #header>
          <div class="card-header">
            <span>订单商品</span>
            <el-button type="primary" size="small" @click="addOrderItem">
              添加商品
            </el-button>
          </div>
        </template>

        <!-- 订单项列表 -->
        <div
            v-for="(item, index) in orderItems"
            :key="index"
            class="order-item"
        >
          <div class="order-item-header">
            <h3>商品 #{{ index + 1 }}</h3>
            <el-button
                v-if="orderItems.length > 1"
                type="danger"
                size="small"
                @click="removeOrderItem(index)"
            >
              移除
            </el-button>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品型号" required>
                <el-input v-model="item.model_number" placeholder="请输入产品型号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="库存商品ID" required>
                <el-input
                    v-model.number="item.item_id"
                    placeholder="请输入库存商品ID"
                    type="number"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="数量" required>
                <el-input
                    v-model.number="item.quantity"
                    placeholder="请输入购买数量"
                    type="number"
                    :min="1"
                    @input="updateSubtotal(index)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单价" required>
                <el-input
                    v-model.number="item.price_per_piece"
                    placeholder="请输入单价"
                    type="number"
                    :min="0"
                    :step="0.01"
                    @input="updateSubtotal(index)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="小计">
                <el-input
                    v-model.number="item.subtotal"
                    placeholder="小计金额"
                    type="number"
                    :min="0"
                    :step="0.01"
                    disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 订单总计 -->
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="24" class="text-right">
            <h3>订单总金额: {{ orderForm.total_amount.toFixed(2) }} 元</h3>
          </el-col>
        </el-row>
      </el-card>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="submitOrder">提交订单</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.form-container {
  padding: 20px;
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;
}

.order-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
}

.order-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-item-header h3 {
  margin: 0;
}

.el-form-item {
  margin-bottom: 15px;
}

.text-right {
  text-align: right;
}

.form-actions {
  margin-top: 25px;
  text-align: center;
}

.el-divider {
  margin: 15px 0;
}
</style>