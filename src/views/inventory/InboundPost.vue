<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// Form data
const formData = ref({
  productModel: '',      // 产品型号
  manufacturer: '',      // 制造厂商
  specification: '',     // 规格
  surface: '',          // 表面处理
  category: '',         // 分类
  warehouseCode: '',    // 仓库编码
  totalPieces: '',      // 总片数
  boxCount: '',         // 箱数
  piecesPerBox: '',     // 每箱片数
  unitPrice: ''         // 单片价格
})

// Options for category and surface treatment
const categoryOptions = ['墙砖', '地砖']
const surfaceOptions = ['抛光', '哑光', '釉面', '通体大理石', '微晶石', '岩板']

// Submit function
const submitInventory = async () => {
  try {
    // Validate required fields
    const requiredFields = [
      'productModel', 'manufacturer', 'specification', 'surface', 'category',
      'warehouseCode', 'totalPieces', 'boxCount', 'piecesPerBox', 'unitPrice'
    ]
    for (const field of requiredFields) {
      if (!formData.value[field]) {
        ElMessage.error('请填写所有必填字段')
        return
      }
    }

    // Simulated API call - replace with your actual backend endpoint
    const response = await fetch('/api/inventory/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) {
      throw new Error('提交失败')
    }

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
    productModel: '',
    manufacturer: '',
    specification: '',
    surface: '',
    category: '',
    warehouseCode: '',
    totalPieces: '',
    boxCount: '',
    piecesPerBox: '',
    unitPrice: ''
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
            <el-input v-model="formData.productModel" placeholder="请输入产品型号" />
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
            <el-input v-model="formData.specification" placeholder="请输入规格" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库编码" required>
            <el-input v-model="formData.warehouseCode" placeholder="请输入仓库编码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品分类" required>
            <el-radio-group v-model="formData.category">
              <el-radio
                  v-for="item in categoryOptions"
                  :key="item"
                  :label="item"
                  class="radio-item"
              >
                {{ item }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="表面处理" required>
            <el-radio-group v-model="formData.surface">
              <el-radio
                  v-for="item in surfaceOptions"
                  :key="item"
                  :label="item"
                  class="radio-item"
              >
                {{ item }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="总片数" required>
            <el-input v-model.number="formData.totalPieces" placeholder="请输入总片数" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="箱数" required>
            <el-input v-model.number="formData.boxCount" placeholder="请输入箱数" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="每箱片数" required>
            <el-input v-model.number="formData.piecesPerBox" placeholder="请输入每箱片数" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="单片价格" required>
            <el-input v-model.number="formData.unitPrice" placeholder="请输入单片价格" type="number" />
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