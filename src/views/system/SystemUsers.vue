<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { updateUser } from '@/api/user';
import type { User } from '@/types/api';
import { Plus } from '@element-plus/icons-vue';

// User form data（与 User 类型一致）
const userForm = ref<Partial<User>>({
  avatar: '',
  username: '',
  password: '',
  phone: '',
});

// 假设有一个用户 ID 用于更新（实际应用中可能从路由参数或状态管理获取）
const userId = ref<number>(1); // 示例 ID，需根据实际情况动态设置

// Handle avatar upload
const handleAvatarUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    userForm.value.avatar = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  ElMessage.success('头像上传成功');
  return false; // 阻止默认上传行为
};

// Remove avatar
const removeAvatar = () => {
  userForm.value.avatar = '';
  ElMessage.success('头像已删除');
};

// Submit user info（匹配 /api/users/{id}）
const submitUserInfo = async () => {
  try {
    // Validate required fields
    if (!userForm.value.username) {
      ElMessage.error('用户名是必填项');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!userForm.value.phone || !phoneRegex.test(userForm.value.phone)) {
      ElMessage.error('请输入有效的11位手机号码');
      return;
    }

    // Prepare data for API（确保类型正确）
    const submitData = {
      avatar: userForm.value.avatar || undefined,
      username: userForm.value.username,
      password: userForm.value.password || undefined, // 可选字段
      phone: userForm.value.phone,
    };

    // API call
    const response = await updateUser(userId.value, submitData);
    const data = response.data;
    if (data.code === 200) {
      ElMessage.success('用户信息更新成功');
    } else {
      throw new Error('响应状态异常');
    }
  } catch (error) {
    console.error('Failed to update user info:', error);
    ElMessage.error('更新失败，请稍后重试');
  }
};

// Reset form
const resetForm = () => {
  userForm.value = {
    avatar: '',
    username: '',
    password: '',
    phone: '',
  };
};
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
          <div v-if="userForm.avatar" class="avatar-wrapper">
            <img :src="userForm.avatar" class="avatar" />
            <el-button
                type="danger"
                size="small"
                class="remove-avatar-btn"
                @click.stop="removeAvatar"
            >
              删除
            </el-button>
          </div>
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
        <el-input v-model="userForm.phone" placeholder="请输入电话" maxlength="11" />
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

  border: 2px dashed #dcdfe6;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;

  object-fit: cover;
}

.remove-avatar-btn {
  position: absolute;
  top: 5px;
  right: -50px;
  padding: 5px 10px;
  font-size: 12px;
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