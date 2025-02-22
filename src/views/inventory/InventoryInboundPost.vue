<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// Form data（与inventory_item表字段一致）
const formData = ref({
  model_number: '',      // 产品型号
  manufacturer: '',      // 制造厂商
  specification: '',     // 规格（如600x600mm）
  surface: <number | null>null, // 表面处理（1=抛光, 2=哑光, etc.）
  category: <number | null>null, // 分类（1=墙砖, 2=地砖）
  warehouse_num: <number | ''>'', // 仓库编码
  total_pieces: <number | ''>'', // 总片数
  pieces_per_box: <number | ''>'', // 每箱片数
  price_per_piece: <number | ''>'', // 单片价格（单位：元）
  remark: ''            // 备注（可选）
})

// Options for category and surface treatment（与数据库枚举一致）
const categoryOptions = [
  { label: '墙砖', value: 1 },
  { label: '地砖', value: 2 }
]
const surfaceOptions = [
  { label: '抛光', value: 1 },
  { label: '哑光', value: 2 },
  { label: '釉面', value: 3 },
  { label: '通体大理石', value: 4 },
  { label: '微晶石', value: 5 },
  { label: '岩板', value: 6 }
]

// Submit function（匹配接口 /api/inventory/items）
const submitInventory = async () => {
  try {
    // Validate required fields
    const requiredFields = {
      model_number: '产品型号',
      manufacturer: '制造厂商',
      specification: '规格',
      surface: '表面处理',
      category: '产品分类',
      warehouse_num: '仓库编码',
      total_pieces: '总片数',
      pieces_per_box: '每箱片数',
      price_per_piece: '单片价格'
    }
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData.value[field as keyof typeof formData.value]) {
        ElMessage.error(`请填写${label}`)
        return
      }
    }

    // Validate specification format (e.g., 600x600mm)
    if (!/^[0-9]+x[0-9]+mm$/.test(formData.value.specification)) {
      ElMessage.error('规格格式错误，应为如“600x600mm”')
      return
    }

    // API call
    const response = await fetch('/api/inventory/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) {
      throw new Error('提交失败')
    }

    const data = await response.json()
    ElMessage.success('入库记录提交成功')
    // Reset form after successful submission
    resetForm()
  } catch (error) {
    console.error('Submission failed:', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}

// Reset form function
const resetForm = () => {
  formData.value = {
    model_number: '',
    manufacturer: '',
    specification: '',
    surface: null,
    category: null,
    warehouse_num: '',
    total_pieces: '',
    pieces_per_box: '',
    price_per_piece: '',
    remark: ''
  }
}
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
            <el-input v-model.number="formData.price_per_piece" placeholder="请输入单片价格" type="number" step="0.01" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
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