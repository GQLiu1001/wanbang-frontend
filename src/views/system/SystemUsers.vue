<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// User form data
const userForm = ref({
  avatar: '',     // 头像URL
  username: '',   // 用户名
  password: '',   // 密码
  phone: ''       // 手机号
})

// Handle avatar upload
const handleAvatarUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    userForm.value.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
  ElMessage.success('头像上传成功')
}

// Submit user info
const submitUserInfo = async () => {
  try {
    // Validate required fields
    if (!userForm.value.username || !userForm.value.email) {
      ElMessage.error('用户名和邮箱为必填项')
      return
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(userForm.value.phone)) {
      ElMessage.error('请输入有效的手机号码')
      return
    }

    // Simulated API call - replace with your actual backend endpoint
    const response = await fetch('/api/user/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userForm.value)
    })

    if (!response.ok) {
      throw new Error('更新失败')
    }

    ElMessage.success('用户信息更新成功')
  } catch (error) {
    console.error('Failed to update user info:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// Reset form
const resetForm = () => {
  userForm.value = {
    avatar: '',
    username: '',
    password: '',
    phone: ''
  }
}
</script>

<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <hr>
    <el-form :model="userForm" label-width="100px" class="user-form">
      <!-- Avatar (centered) -->
      <el-form-item label="" class="avatar-item">
        <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :before-upload="handleAvatarUpload"
            accept="image/*"
        >
          <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <!-- Other fields (stacked vertically) -->
      <el-form-item label="用户名" required>
        <el-input v-model="userForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码（可选）"
            show-password
        />
      </el-form-item>
      <el-form-item label="电话" required>
        <el-input v-model="userForm.phone" placeholder="请输入电话" />
      </el-form-item>

      <!-- Buttons -->
      <el-form-item>
        <el-button type="primary" @click="submitUserInfo">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}

.user-form {
  margin-top: 20px;
  width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.avatar-item {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
  margin-left: 90px;
}

.avatar-uploader .el-upload {
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  border-radius: 50%;
  border: 2px dashed #dcdfe6;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

h1 {
  margin-bottom: 20px;
}

hr {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}
</style>