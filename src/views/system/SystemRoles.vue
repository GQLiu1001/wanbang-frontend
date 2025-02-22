<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 用户列表数据
interface User {
  username: string
  phone: string
  role_key: string
  description: string
}

// Store user list and pagination state
const userList = ref<User[]>([])
const page = ref(1) // 当前页码
const size = ref(10) // 每页条数
const total = ref(0) // 总记录数

// Fetch user list with pagination
const fetchUserList = async () => {
  try {
    const url = new URL('/api/users', window.location.origin)
    url.searchParams.append('page', page.value.toString())
    url.searchParams.append('size', size.value.toString())

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) {
      throw new Error('获取用户列表失败')
    }
    const data = await response.json()
    if (data.code === 200 && data.data?.items) {
      userList.value = data.data.items
      total.value = data.data.total || 0
    } else {
      throw new Error('数据格式异常')
    }
  } catch (error) {
    console.error('Failed to fetch user list:', error)
    ElMessage.error('获取用户列表失败，请稍后重试')
  }
}

// Pagination handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchUserList()
}

const handleSizeChange = (newSize: number) => {
  size.value = newSize
  page.value = 1 // 重置到第一页
  fetchUserList()
}

// 移除超级管理员检查和提升管理员功能，因为默认开放权限
onMounted(() => {
  fetchUserList() // 直接加载用户列表，无需权限检查
})
</script>

<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <hr>

    <!-- 用户列表 -->
    <div class="user-list-container">
      <h2>所有用户</h2>
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="200" />
        <el-table-column prop="phone" label="手机号" width="200" />
        <el-table-column prop="role_key" label="角色标识" width="150" />
        <el-table-column prop="description" label="角色描述" min-width="200" />
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
            :current-page="page"
            :page-size="size"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.user-list-container {
  width: 900px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 15px;
}

hr {
  width: 100%;
  max-width: 700px;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 20px;
}
</style>