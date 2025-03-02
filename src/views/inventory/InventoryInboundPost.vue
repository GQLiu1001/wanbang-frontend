<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { postInventoryItem } from '@/api/inventory';
import type { InventoryItem } from '@/types/interfaces.ts';

// Form data（与 InventoryItem 类型一致）
const formData = ref<Partial<InventoryItem> & { box_count?: number }>({
  model_number: '',
  manufacturer: '',
  specification: '',
  surface: null, // 可为 null，与数据库一致
  category: null, // 可为 null，与数据库一致
  warehouse_num: null, // 修改为 null，与类型一致
  total_pieces: null, // 修改为 null，提交时需验证
  pieces_per_box: null, // 修改为 null，提交时需验证
  price_per_piece: null, // 修改为 null，提交时需验证
  remark: '',
});

// Options for category and surface treatment（与数据库枚举一致）
const categoryOptions = [
  { label: '墙砖', value: 1 },
  { label: '地砖', value: 2 },
];
const surfaceOptions = [
  { label: '抛光', value: 1 },
  { label: '哑光', value: 2 },
  { label: '釉面', value: 3 },
  { label: '通体大理石', value: 4 },
  { label: '微晶石', value: 5 },
  { label: '岩板', value: 6 },
];

// Submit function（匹配接口 /api/inventory/items）
const submitInventory = async () => {
  try {
    // Validate required fields
    const requiredFields: Record<string, string> = {
      model_number: '产品型号',
      manufacturer: '制造厂商',
      specification: '规格',
      surface: '表面处理',
      category: '产品分类',
      warehouse_num: '仓库编码',
      total_pieces: '总片数',
      pieces_per_box: '每箱片数',
      price_per_piece: '单片价格',
    };
    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData.value[field as keyof typeof formData.value];
      if (value === null || value === undefined || value === '') {
        ElMessage.error(`请填写${label}`);
        return;
      }
    }

    // Validate specification format (e.g., 600x600mm)
    if (!/^[0-9]+x[0-9]+mm$/.test(formData.value.specification!)) {
      ElMessage.error('规格格式错误，应为如“600x600mm”');
      return;
    }

    // Prepare data for API（确保类型正确）
    const submitData = {
      model_number: formData.value.model_number!,
      manufacturer: formData.value.manufacturer!,
      specification: formData.value.specification!,
      surface: formData.value.surface!,
      category: formData.value.category!,
      warehouse_num: Number(formData.value.warehouse_num),
      total_pieces: Number(formData.value.total_pieces),
      pieces_per_box: Number(formData.value.pieces_per_box),
      price_per_piece: Number(formData.value.price_per_piece),
      remark: formData.value.remark || undefined,
    };

    // API call
    const response = await postInventoryItem(submitData);
    const data = response.data;
    if (data.code === 201) {
      ElMessage.success('入库记录提交成功');
      resetForm();
    } else {
      throw new Error('响应状态异常');
    }
  } catch (error) {
    console.error('Submission failed:', error);
    ElMessage.error('提交失败，请稍后重试');
  }
};

// Reset form function
const resetForm = () => {
  formData.value = {
    model_number: '',
    manufacturer: '',
    specification: '',
    surface: null,
    category: null,
    warehouse_num: null,
    total_pieces: null,
    pieces_per_box: null,
    price_per_piece: null,
    remark: '',
  };
};
</script>

<template>
  <h1>提交入库</h1>
  <hr>
  <div class="form-container">
    <el-form :model="formData" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品型号" required>
            <el-input v-model="formData.model_number" placeholder="请输入产品型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="制造厂商" required>
            <el-input v-model="formData.manufacturer" placeholder="请输入制造厂商" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="规格" required>
            <el-input v-model="formData.specification" placeholder="请输入规格（如600x600mm）" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库编码" required>
            <el-input v-model.number="formData.warehouse_num" placeholder="请输入仓库编码" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品分类" required>
            <el-radio-group v-model="formData.category">
              <el-radio
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.value"
                  class="radio-item"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="表面处理" required>
            <el-radio-group v-model="formData.surface">
              <el-radio
                  v-for="item in surfaceOptions"
                  :key="item.value"
                  :label="item.value"
                  class="radio-item"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="总片数" required>
            <el-input v-model.number="formData.total_pieces" placeholder="请输入总片数" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="每箱片数" required>
            <el-input v-model.number="formData.pieces_per_box" placeholder="请输入每箱片数" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="单片价格" required>
            <el-input
                v-model.number="formData.price_per_piece"
                placeholder="请输入单片价格"
                type="number"
                step="0.01"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="备注">
            <el-input v-model="formData.remark" placeholder="请输入备注（可选）" type="textarea" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="submitInventory">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.form-container {
  padding: 40px;
}

.radio-item {
  margin-right: 10px;
}
</style>