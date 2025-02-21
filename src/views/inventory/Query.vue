<script setup lang="ts">
import { ref } from 'vue'

// Search parameters
const value = ref('') // Selected option
const category = ref('') // Product category
const surface = ref('') // Surface treatment
const searchResults = ref([]) // Store search results

// Category and surface treatment options
const categoryOptions = ['墙砖', '地砖']
const surfaceOptions = ['抛光', '哑光', '釉面', '通体大理石', '微晶石', '岩板']

// Search function
const performSearch = async () => {
  try {
    // Simulated API call - replace with your actual backend endpoint
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productType: value.value,
        category: category.value,
        surface: surface.value
      })
    })

    const data = await response.json()
    searchResults.value = data.results || []
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  }
}
</script>

<template>
  <div class="header-container">
    <h1>库存查询</h1>
    <div class="search-controls">
      <div class="options-column">
        <div class="option-group">
          <div class="label">产品分类：</div>
          <el-radio-group v-model="category">
            <el-radio
                v-for="item in categoryOptions"
                :key="item"
                :label="item"
                class="radio-item"
            >
              {{ item }}
            </el-radio>
          </el-radio-group>
        </div>
        <div class="option-group">
          <div class="label">表面处理：</div>
          <el-radio-group v-model="surface">
            <el-radio
                v-for="item in surfaceOptions"
                :key="item"
                :label="item"
                class="radio-item"
            >
              {{ item }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <el-button
          type="primary"
          round
          class="search-btn"
          @click="performSearch"
      >
        搜索
      </el-button>
    </div>
  </div>
  <hr>

  <!-- Search Results -->
  <div class="results mt-4">
    <el-table
        v-if="searchResults.length > 0"
        :data="searchResults"
        style="width: 100%"
        border
    >
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="productName" label="产品名称" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="surface" label="表面处理" width="120" />
      <el-table-column prop="stock" label="库存量" width="120" />
    </el-table>
    <div v-else class="no-data">
      {{ value || category || surface ? '暂无匹配数据' : '请输入搜索条件' }}
    </div>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
}

.search-controls {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 40px;
}

.options-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.label {
  white-space: nowrap;
  padding-top: 4px;
  color: #606266;
}

.radio-item {
  margin-right: 34px;
}

.search-btn {
  height: fit-content;
  padding: 24px 30px;
  font-size: 16px;
}
.results {
  margin-top: 20px;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>