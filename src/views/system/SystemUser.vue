<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <hr />
    <el-form :model="userForm" label-width="100px" class="user-form">
      <el-form-item label="" class="avatar-item">
        <el-upload
            class="avatar-uploader"
            action="/api/upload"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
        :on-success="handleAvatarSuccess"
        accept="image/*"
        :headers="uploadHeaders"
        method="post"
        >
        <div v-if="userForm.avatar" class="avatar-wrapper">
          <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
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

      <el-form-item label="用户名" required>
        <el-input v-model="userForm.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="电话" required>
        <el-input v-model="userForm.phone" placeholder="请输入电话" maxlength="11" />
      </el-form-item>

      <el-form-item label="旧密码">
        <el-input
            v-model="userForm.oldPassword"
            type="password"
            placeholder="请输入旧密码（修改密码时必填）"
            show-password
        />
      </el-form-item>

      <el-form-item label="新密码">
        <el-input
            v-model="userForm.newPassword"
            type="password"
            placeholder="请输入新密码（可选）"
            show-password
        />
      </el-form-item>

      <el-form-item label="确认密码">
        <el-input
            v-model="userForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码（可选）"
            show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitUserInfo">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { updateUser } from '@/api/user';
import axios from '@/utils/axios.ts';
import { Plus } from '@element-plus/icons-vue';
import router from '@/router';

// 获取当前用户信息
const userStore = useUserStore();
const currentUser = userStore.getUserInfo();

if (!currentUser) {
  ElMessage.error('未登录，请先登录');
  router.push('/login');
}

// 用户表单数据
const userForm = ref({
  avatar: currentUser?.avatar || '',
  username: currentUser?.username || '',
  phone: currentUser?.phone || '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 用户 ID
const userId = ref<number>(currentUser?.id || 0);

// 上传 headers（带上鉴权 token）
const uploadHeaders = ref({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`, // 假设使用 Sa-Token 的 token
});

// 头像上传前验证
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2; // 限制 2MB
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB');
    return false;
  }
  return true;
};

// 头像上传成功回调
const handleAvatarSuccess = (response: any, file: File, fileList: any) => {
  try {
    const { code, message, data } = response;
    if (code === 200) {
      userForm.value.avatar = data.fileUrl; // 后端返回的 fileUrl
      ElMessage.success('头像上传成功');
    } else {
      ElMessage.error(message || '头像上传失败');
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败，请重试');
  }
};

// 删除头像
const removeAvatar = () => {
  userForm.value.avatar = '';
  ElMessage.success('头像已删除');
};

// 提交用户信息
const submitUserInfo = async () => {
  try {
    if (!userForm.value.username) {
      ElMessage.error('用户名是必填项');
      return;
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!userForm.value.phone || !phoneRegex.test(userForm.value.phone)) {
      ElMessage.error('请输入有效的11位手机号码');
      return;
    }

    // 密码相关校验
    if (userForm.value.oldPassword || userForm.value.newPassword || userForm.value.confirmPassword) {
      if (!userForm.value.oldPassword) {
        ElMessage.error('请输入旧密码');
        return;
      }
      if (!userForm.value.newPassword) {
        ElMessage.error('请输入新密码');
        return;
      }
      if (!userForm.value.confirmPassword) {
        ElMessage.error('请再次输入新密码');
        return;
      }
      if (userForm.value.newPassword !== userForm.value.confirmPassword) {
        ElMessage.error('两次输入的新密码不一致');
        return;
      }
      if (userForm.value.newPassword.length < 6) {
        ElMessage.error('新密码长度需至少6位');
        return;
      }
    }

    // 构建提交数据
    const submitData = {
      avatar: userForm.value.avatar || '', // 使用 fileUrl 或空字符串
      username: userForm.value.username,
      phone: userForm.value.phone,
      ...(userForm.value.newPassword && {
        oldPassword: userForm.value.oldPassword,
        password: userForm.value.newPassword,
      }),
    };

    // 调用 updateUser 更新用户信息和密码
    await updateUser(userId.value, submitData);

    // 更新本地存储的用户信息
    userStore.setUserInfo({
      id: userId.value,
      username: userForm.value.username,
      avatar: userForm.value.avatar || '',
      phone: userForm.value.phone,
    });

    ElMessage.success('用户信息更新成功');
    if (userForm.value.newPassword) {
      ElMessage.success('密码已更新，请重新登录');
      userStore.clearUserInfo();
      router.push('/login');
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    ElMessage.error('更新失败，请稍后重试');
  }
};

// 重置表单
const resetForm = () => {
  userForm.value = {
    avatar: currentUser?.avatar || '',
    username: currentUser?.username || '',
    phone: currentUser?.phone || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
};
</script>

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
  border-radius: 6px;
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