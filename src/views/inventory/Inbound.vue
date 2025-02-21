<script setup lang="ts">
import { ref } from 'vue'
import {ElMessage} from "element-plus";

// 表单数据
const formData = ref({
  model: '',       // 产品型号
  size: '',        // 产品尺寸
  quantity: '',    // 数量
  warehouse: ''    // 仓库编号
})

const searchResults = ref([]) // 入库记录

// 提交入库
const submitForm = async () => {
  try {
    // 模拟API调用
    const response = await fetch('/api/inbound', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()
    if(data.success) {
      ElMessage.success('入库成功')
      // 清空表单
      formData.value = { model: '', size: '', quantity: '', warehouse: '' }
      // 刷新记录
      loadRecords()
    }
  } catch (error) {
    ElMessage.error('入库失败')
    console.error('Submit failed:', error)
  }
}

// 加载入库记录
const loadRecords = async () => {
  try {
    const response = await fetch('/api/inbound-records')
    const data = await response.json()
    searchResults.value = data.records || []
  } catch (error) {
    console.error('加载记录失败:', error)
  }
}

// 初始化加载记录
loadRecords()
</script>

<template>
  <div class="container">
    <div class="header-container">
      <div class="page-title">入库记录</div>
      <div class="form-container">
        <el-form :model="formData" label-position="right" class="demo-form-inline">
          <div class="form-row">
            <el-form-item label="产品型号：" prop="model">
              <el-input
                  v-model="formData.model"
                  placeholder="请输入产品型号"
                  clearable
              />
            </el-form-item>

            <el-form-item label="产品尺寸：" prop="size">
              <el-input
                  v-model="formData.size"
                  placeholder="长 x 宽 (单位：mm)"
                  clearable
              />
            </el-form-item>

            <el-form-item label="数量：" prop="quantity">
              <el-input-number
                  v-model="formData.quantity"
                  :min="1"
                  controls-position="right"
              />
            </el-form-item>

            <el-form-item label="仓库编号：" prop="warehouse">
              <el-input
                  v-model="formData.warehouse"
                  placeholder="请输入仓库编号"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>
          </div>
        </el-form>

        <el-button
            type="primary"
            class="submit-btn"
            @click="submitForm"
        >
          <i class="el-icon-upload2"></i>
          提交入库
        </el-button>
      </div>
    </div>

    <!-- 入库记录表格 -->
    <div class="results">
      <el-table
          :data="searchResults"
          style="width: 100%"
          border
          v-loading="loading"
      >
        <el-table-column prop="inboundTime" label="入库时间" width="180" />
        <el-table-column prop="model" label="产品型号" />
        <el-table-column prop="size" label="尺寸" width="120" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="warehouse" label="仓库编号" width="120" />
        <el-table-column prop="operator" label="操作人" width="120" />
      </el-table>

      <div v-if="searchResults.length === 0" class="no-data">
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {

  max-width: 1400px;
  margin: 0 auto;
}

.header-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.form-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
}

.el-input {
  width: 200px;
}

.submit-btn {
  padding: 12px 36px;
  font-size: 16px;
  border-radius: 20px;
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64,158,255,0.3);
}

.results {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
}

.no-data {
  padding: 40px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>