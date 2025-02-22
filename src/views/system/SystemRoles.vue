<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 用户列表数据
interface User {
  id: number
  username: string
  roleId: number
}

const userList = ref<User[]>([])
const isSuperAdmin = ref(false) // 是否为超级管理员

// 获取用户列表（仅超级管理员）
const fetchUserList = async () => {
  try {
    const response = await fetch('/api/user/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) {
      throw new Error('获取用户列表失败')
    }
    userList.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch user list:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 一键提升为管理员
const promoteToAdmin = async (userId: number) => {
  try {
    const response = await fetch(`/api/user/${userId}/promote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) {
      throw new Error('提升管理员失败')
    }
    ElMessage.success('已成功提升为管理员')
    // 刷新用户列表
    await fetchUserList()
  } catch (error) {
    console.error('Failed to promote user:', error)
    ElMessage.error('提升管理员失败，请稍后重试')
  }
}

// 检查当前用户是否为超级管理员
const checkSuperAdmin = async () => {
  try {
    const response = await fetch('/api/user/check-admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    const result = await response.json()
    isSuperAdmin.value = result.isSuperAdmin
    if (isSuperAdmin.value) {
      await fetchUserList()
    }
  } catch (error) {
    console.error('Failed to check admin status:', error)
    ElMessage.error('权限检查失败')
  }
}

onMounted(() => {
  checkSuperAdmin()
})
</script>

<template>
  <div class="page-container">
    <h1>权限管理</h1>
    <hr>

    <!-- 超级管理员用户列表 -->
    <div v-if="isSuperAdmin" class="user-list-container">
      <h2>所有用户</h2>
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="150" />
        <el-table-column prop="username" label="用户昵称" width="200" />
        <el-table-column prop="roleId" label="角色ID" width="150" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
                size="small"
                type="primary"
                @click="promoteToAdmin(scope.row.id)"
                :disabled="scope.row.roleId === 1"
            >
              提升为管理员
            </el-button>
            <!-- 假设1是管理员角色ID -->
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 非超级管理员提示 -->
    <div v-else class="no-permission">
      <el-alert
          title="权限不足"
          type="warning"
          description="只有超级管理员才能查看用户列表和管理权限"
          :closable="false"
      />
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
  width: 700px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.no-permission {
  padding: 50px;
  text-align: center;
  align-content: center;
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
</style>